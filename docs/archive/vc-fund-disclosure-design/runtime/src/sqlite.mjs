import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const specRoot = resolve(here, "../..");

export const SCHEMA_PATH = resolve(specRoot, "schema.sql");
export const SEED_SOURCES_PATH = resolve(specRoot, "seed-sources.sql");
export const DEFAULT_DB_PATH = "~/.local/share/moonklabs/vc-funds/vc-funds.sqlite";

export function expandPath(path) {
  if (!path || path === "auto") return expandPath(DEFAULT_DB_PATH);
  if (path === ":memory:") return path;
  if (path.startsWith("~/")) return resolve(homedir(), path.slice(2));
  return resolve(path);
}

export function sqlString(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

export function sqlJson(value) {
  return sqlString(JSON.stringify(value ?? null));
}

export function assertSqliteAvailable() {
  const result = spawnSync("sqlite3", ["-version"], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`sqlite3 is required for this draft runtime: ${result.stderr || result.error?.message || "not found"}`);
  }
  return result.stdout.trim();
}

export function execSql(dbPath, sql, opts = {}) {
  const resolved = expandPath(dbPath);
  if (resolved !== ":memory:") mkdirSync(dirname(resolved), { recursive: true });
  const args = ["-batch", "-bail"];
  if (opts.json) args.push("-json");
  if (opts.readonly) args.push("-readonly");
  args.push(resolved);

  const result = spawnSync("sqlite3", args, {
    input: sql,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024
  });

  if (result.status !== 0) {
    throw new Error(`sqlite3 failed (${result.status}): ${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

export function queryJson(dbPath, sql, opts = {}) {
  const output = execSql(dbPath, sql, { ...opts, json: true }).trim();
  if (!output) return [];
  return JSON.parse(output);
}

export function initDatabase(dbPath) {
  assertSqliteAvailable();
  const schema = readFileSync(SCHEMA_PATH, "utf8");
  const seed = readFileSync(SEED_SOURCES_PATH, "utf8");
  execSql(dbPath, `PRAGMA foreign_keys = ON;\n${schema}\n${seed}`);
  return {
    dbPath: expandPath(dbPath),
    schemaPath: SCHEMA_PATH,
    seedSourcesPath: SEED_SOURCES_PATH,
    exists: expandPath(dbPath) === ":memory:" ? true : existsSync(expandPath(dbPath))
  };
}

export function loadSqlFile(dbPath, filePath) {
  const sql = readFileSync(filePath, "utf8");
  execSql(dbPath, `PRAGMA foreign_keys = ON;\n${sql}`);
}
