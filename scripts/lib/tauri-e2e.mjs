import { spawn } from "node:child_process";
import { once } from "node:events";
import { constants } from "node:fs";
import { access, mkdir, rm, symlink } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const APP_DATA_DIRECTORY = "com.nghiathan13.ownlish";
const POLL_INTERVAL_MS = 25;
const WAIT_TIMEOUT_MS = 10_000;
const APP_START_TIMEOUT_MS = 60_000;
const CATALOG_DURATION_EXPRESSION = `(() => {
  if (window.__ownlishCatalogE2E !== undefined) return window.__ownlishCatalogE2E;
  const finish = () => {
    if (!document.querySelector('button.tests__card')) return;
    observer.disconnect();
    requestAnimationFrame(() => {
      window.__ownlishCatalogE2E = performance.now();
    });
  };
  const observer = new MutationObserver(finish);
  observer.observe(document, { childList: true, subtree: true });
  finish();
  return null;
})()`;
const START_PARTS_MEASUREMENT_EXPRESSION = `(() => {
  const start = performance.now();
  let finished = false;
  const finish = () => {
    if (finished || !document.querySelector('.test__option[data-key="A"] .test__option-text')?.textContent?.length) return;
    finished = true;
    observer.disconnect();
    requestAnimationFrame(() => {
      window.__ownlishPartsE2E = performance.now() - start;
    });
  };
  const observer = new MutationObserver(finish);
  observer.observe(document, { childList: true, characterData: true, subtree: true });
  document.querySelector('button.tests__card').click();
  return true;
})()`;

function percentile(samples, percentileValue) {
  const sorted = [...samples].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * percentileValue))];
}

function summarize(samples) {
  return {
    p50: +percentile(samples, 0.5).toFixed(2),
    p95: +percentile(samples, 0.95).toFixed(2),
    min: +Math.min(...samples).toFixed(2),
    max: +Math.max(...samples).toFixed(2),
  };
}

function sleep(duration) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, duration));
}

async function waitFor(operation, description, timeout = WAIT_TIMEOUT_MS) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const value = await operation();
    if (value) return value;
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error(`timed out waiting for ${description}`);
}

async function reservePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("failed to reserve an inspector port");
  }
  await new Promise((resolveClose) => server.close(resolveClose));
  return address.port;
}

function pnpmCommand() {
  return process.platform === "win32" ? "pnpm.cmd" : "pnpm";
}

function startProcess(command, args, options) {
  const output = [];
  const processHandle = spawn(command, args, {
    ...options,
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const collectOutput = (chunk) => {
    if (output.join("").length < 16_000) output.push(chunk.toString());
  };
  processHandle.stdout.on("data", collectOutput);
  processHandle.stderr.on("data", collectOutput);
  return { processHandle, output };
}

async function stopProcess(processHandle) {
  if (!processHandle || processHandle.exitCode !== null) return;
  if (process.platform === "win32") {
    processHandle.kill("SIGTERM");
  } else {
    process.kill(-processHandle.pid, "SIGTERM");
  }
  await Promise.race([
    once(processHandle, "exit"),
    sleep(2_000),
  ]);
}

async function viteIsRunning(viteUrl) {
  try {
    const response = await fetch(viteUrl);
    return response.ok;
  } catch {
    return false;
  }
}

async function startVite(projectRoot, port) {
  const viteUrl = `http://localhost:${port}`;
  const vite = startProcess(
    pnpmCommand(),
    ["exec", "vite", "--port", String(port)],
    { cwd: projectRoot, env: process.env },
  );
  try {
    await waitFor(() => viteIsRunning(viteUrl), "Vite");
    return vite.processHandle;
  } catch (error) {
    await stopProcess(vite.processHandle);
    throw new Error(`Vite did not start: ${vite.output.join("")}`, { cause: error });
  }
}

async function createAppDataDirectory(dataDirectory) {
  const root = join(tmpdir(), `ownlish-e2e-${process.pid}-${Date.now()}`);
  const appDirectory = join(root, APP_DATA_DIRECTORY);
  await mkdir(appDirectory, { recursive: true });
  await symlink(resolve(dataDirectory), join(appDirectory, "ownlish-data"), "dir");
  return root;
}

class WebKitInspector {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.targetId = null;
    this.targetReady = new Promise((resolveTarget) => {
      this.resolveTarget = resolveTarget;
    });

    this.socket.addEventListener("message", (event) => this.handleMessage(event.data));
  }

  async connect() {
    await once(this.socket, "open");
    await this.targetReady;
  }

  close() {
    this.socket.close();
  }

  handleMessage(rawMessage) {
    const message = JSON.parse(rawMessage);
    if (message.method === "Target.targetCreated" && message.params.targetInfo.type === "page") {
      this.targetId = message.params.targetInfo.targetId;
      this.resolveTarget();
      return;
    }
    if (message.method !== "Target.dispatchMessageFromTarget") return;

    const nested = JSON.parse(message.params.message);
    const pending = this.pending.get(nested.id);
    if (!pending) return;
    this.pending.delete(nested.id);
    pending.resolve(nested.result);
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.socket.send(JSON.stringify({
      id,
      method: "Target.sendMessageToTarget",
      params: {
        targetId: this.targetId,
        message: JSON.stringify({ id, method, params }),
      },
    }));
    return new Promise((resolveMessage) => this.pending.set(id, { resolve: resolveMessage }));
  }

  async evaluate(expression, awaitPromise = false) {
    const response = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise,
    });
    if (response.wasThrown) throw new Error(JSON.stringify(response.result));
    return response.result.value;
  }

  async reload() {
    await this.send("Page.reload");
  }
}

async function connectInspector(port) {
  const indexUrl = `http://127.0.0.1:${port}/`;
  const indexHtml = await waitFor(async () => {
    try {
      const response = await fetch(indexUrl);
      if (!response.ok) return null;
      const html = await response.text();
      return html.includes("/socket/") ? html : null;
    } catch {
      return null;
    }
  }, "WebKit inspector", APP_START_TIMEOUT_MS);
  const match = indexHtml.match(/\/socket\/[^']+/);
  if (!match) throw new Error("WebKit inspector did not expose a page target");

  const inspector = new WebKitInspector(`ws://127.0.0.1:${port}${match[0]}`);
  await inspector.connect();
  return inspector;
}

async function measureFlow(inspector, flow, iterations) {
  const samples = [];

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    await inspector.reload();

    if (flow === "catalog") {
      samples.push(await waitFor(
        () => inspector.evaluate(CATALOG_DURATION_EXPRESSION),
        "catalog first paint",
      ));
      continue;
    }

    await waitFor(
      () => inspector.evaluate("Boolean(document.querySelector('button.tests__card'))"),
      "catalog overview",
    );
    await inspector.evaluate(START_PARTS_MEASUREMENT_EXPRESSION);
    samples.push(await waitFor(
      () => inspector.evaluate("window.__ownlishPartsE2E ?? null"),
      "parts first paint",
    ));
  }

  return summarize(samples);
}

export async function runTauriE2EBenchmark({ dataDirectory, flow, iterations }) {
  await access(join(dataDirectory, "catalog.json"), constants.R_OK);

  const projectRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
  const vitePort = await reservePort();
  const inspectorPort = await reservePort();
  const xdgDataHome = await createAppDataDirectory(dataDirectory);
  const vite = await startVite(projectRoot, vitePort);
  const tauri = startProcess(
    pnpmCommand(),
    [
      "tauri",
      "dev",
      "--no-dev-server",
      "--config",
      JSON.stringify({
        build: {
          beforeDevCommand: "",
          devUrl: `http://localhost:${vitePort}`,
        },
      }),
    ],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        WEBKIT_INSPECTOR_HTTP_SERVER: `127.0.0.1:${inspectorPort}`,
        XDG_DATA_HOME: xdgDataHome,
      },
    },
  );

  let inspector;
  try {
    inspector = await connectInspector(inspectorPort);
    return await measureFlow(inspector, flow, iterations);
  } catch (error) {
    throw new Error(`Tauri E2E benchmark failed: ${tauri.output.join("")}`, { cause: error });
  } finally {
    inspector?.close();
    await stopProcess(tauri.processHandle);
    await stopProcess(vite);
    await rm(xdgDataHome, { force: true, recursive: true });
  }
}
