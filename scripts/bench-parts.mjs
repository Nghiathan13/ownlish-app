#!/usr/bin/env node
/**
 * Benchmark preloading a full test's 7 part JSON files headlessly (fs read) —
 * same hot path as the app's loadTestParts() (entities/toeic-catalog), minus
 * IPC/webview overhead. Target: the first complete test (7 parts) in the catalog.
 *
 * Usage:
 *   node scripts/bench-parts.mjs <ownlish-data-dir> [--iterations N] [--update-baseline]
 *
 * Exit code: 0 = pass (p95 <= threshold), 1 = fail (perf regression / deploy gate).
 * Threshold = max(2ms floor, baselineMs * 1.3); baseline auto-updates on pass
 * when --update-baseline is given (CI, main branch).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE_PATH = join(ROOT, ".github", "perf-baseline-parts.json");
const FLOOR_MS = 2;
const MARGIN = 1.3;

const args = process.argv.slice(2);
const dataDir = resolve(args[0]);
const iterIndex = args.indexOf("--iterations");
const iterations = iterIndex !== -1 ? Number(args[iterIndex + 1]) : 30;
const updateBaseline = args.includes("--update-baseline");

// deterministic target: first complete test (7 parts) in the catalog
const catalog = JSON.parse(readFileSync(join(dataDir, "catalog.json"), "utf8"));
const test = catalog.tests.find((t) => t.parts.length === 7);
if (!test) {
  console.error("[bench-parts] no test with 7 parts found in catalog");
  process.exit(1);
}
const paths = test.parts.map((p) => join(dataDir, p.path));

// warmup (page cache + module init)
for (const p of paths) readFileSync(p, "utf8");

const samples = [];
for (let i = 0; i < iterations; i++) {
  const t0 = performance.now();
  for (const p of paths) readFileSync(p, "utf8");
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
  `[bench-parts] ${test.id} n=${iterations} p50=${p50}ms p95=${p95}ms threshold=${threshold}ms -> ${pass ? "PASS" : "FAIL"}`,
);

if (updateBaseline && pass) {
  const baselineMs = Math.round(p95);
  const thresholdMs = Math.max(FLOOR_MS, Math.ceil(baselineMs * MARGIN));
  if (baselineMs !== baseline.baselineMs || thresholdMs !== baseline.thresholdMs) {
    writeFileSync(
      BASELINE_PATH,
      JSON.stringify({ baselineMs, thresholdMs }, null, 2) + "\n",
    );
    console.log(
      `[bench-parts] baseline updated: baselineMs=${baselineMs} thresholdMs=${thresholdMs}`,
    );
  }
}

process.exit(pass ? 0 : 1);
