#!/usr/bin/env node
/**
 * Benchmark catalog load headlessly (fs read + JSON.parse) — same hot path as
 * the app's loadCatalog() (entities/toeic-catalog), minus IPC/webview overhead.
 *
 * Usage:
 *   node scripts/bench-catalog.mjs <catalog.json> [--iterations N] [--update-baseline]
 *
 * Exit code: 0 = pass (p95 <= threshold), 1 = fail (perf regression / deploy gate).
 * Threshold = max(15ms floor, baselineMs * 1.3); baseline auto-updates on pass
 * when --update-baseline is given (CI, main branch).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE_PATH = join(ROOT, ".github", "perf-baseline.json");
const FLOOR_MS = 5;
const MARGIN = 1.3;

const args = process.argv.slice(2);
const catalogPath = resolve(args[0]);
const iterIndex = args.indexOf("--iterations");
const iterations = iterIndex !== -1 ? Number(args[iterIndex + 1]) : 30;
const updateBaseline = args.includes("--update-baseline");

// warmup (page cache + module init)
const warmRaw = readFileSync(catalogPath, "utf8");
JSON.parse(warmRaw);

const samples = [];
for (let i = 0; i < iterations; i++) {
  const t0 = performance.now();
  const content = readFileSync(catalogPath, "utf8");
  JSON.parse(content);
  samples.push(performance.now() - t0);
}
samples.sort((a, b) => a - b);
const percentile = (p) =>
  samples[Math.min(samples.length - 1, Math.floor(samples.length * p))];
const p50 = +percentile(0.5).toFixed(2);
const p95 = +percentile(0.95).toFixed(2);

const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
const threshold = baseline.thresholdMs ?? FLOOR_MS;
const pass = p95 <= threshold;

console.log(
  `[bench] n=${iterations} p50=${p50}ms p95=${p95}ms threshold=${threshold}ms -> ${pass ? "PASS" : "FAIL"}`,
);

if (updateBaseline && pass) {
  const baselineMs = Math.round(p95);
  const thresholdMs = Math.max(FLOOR_MS, Math.ceil(baselineMs * MARGIN));
  if (baselineMs !== baseline.baselineMs || thresholdMs !== baseline.thresholdMs) {
    writeFileSync(
      BASELINE_PATH,
      JSON.stringify({ baselineMs, thresholdMs }, null, 2) + "\n",
    );
    console.log(`[bench] baseline updated: baselineMs=${baselineMs} thresholdMs=${thresholdMs}`);
  }
}

process.exit(pass ? 0 : 1);
