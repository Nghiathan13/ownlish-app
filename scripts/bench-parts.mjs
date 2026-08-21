#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runTauriE2EBenchmark } from "./lib/tauri-e2e.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE_PATH = join(ROOT, ".github", "perf-baseline-parts.json");

const args = process.argv.slice(2);
const dataDir = resolve(args[0]);
const iterIndex = args.indexOf("--iterations");
const iterations = iterIndex !== -1 ? Number(args[iterIndex + 1]) : 100;
const updateBaseline = args.includes("--update-baseline");

const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
const result = await runTauriE2EBenchmark({
  dataDirectory: dataDir,
  flow: "parts",
  iterations,
});
const threshold = baseline.thresholdMs;
const { p50, p95 } = result;
const pass = p95 <= threshold;

console.log(
  `[bench:e2e:parts] n=${iterations} p50=${p50}ms p95=${p95}ms max=${result.max}ms threshold=${threshold}ms -> ${pass ? "PASS" : "FAIL"}`,
);

if (updateBaseline && pass) {
  const baselineMs = Math.round(p95);
  if (baselineMs !== baseline.baselineMs) {
    writeFileSync(
      BASELINE_PATH,
      JSON.stringify({ ...baseline, baselineMs }, null, 2) + "\n",
    );
    console.log(`[bench:e2e:parts] baseline updated: baselineMs=${baselineMs}`);
  }
}

process.exit(pass ? 0 : 1);
