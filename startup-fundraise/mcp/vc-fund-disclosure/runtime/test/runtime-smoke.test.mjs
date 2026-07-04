import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const runtimeRoot = resolve(import.meta.dirname, "..");
const binPath = resolve(runtimeRoot, "bin/vc-funds.mjs");
const fixtureSql = resolve(runtimeRoot, "fixtures/sample-data.sql");
const kvcaFixture = resolve(runtimeRoot, "fixtures/kvca-associations-basic.csv");

test("CLI setup, resolve, search, and health use the local evidence DB", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-"));
  const dbPath = join(dir, "vc-funds.sqlite");
  try {
    run(["setup", "--db", dbPath, "--json"]);
    run(["load-sql", fixtureSql, "--db", dbPath, "--json"]);

    const sources = runJson(["sources", "--scope", "startup_fund_search", "--db", dbPath, "--json"]);
    assert.ok(sources.source_authority.some((source) => source.source_id === "kvic_fundfinder"));
    assert.ok(sources.source_authority.some((source) => source.source_id === "kvca_diva_associations"));
    assert.ok(sources.source_authority.some((source) => source.source_id === "official_disclosure_documents"));

    const resolution = runJson(["resolve", "프라이머가 Seed 투자 가능한 펀드가 있어?", "--db", dbPath, "--json"]);
    assert.equal(resolution.resolution_status, "resolved_exact");
    assert.equal(resolution.resolved_entities[0].candidate_entity_id, "inv_primer");

    const search = runJson(["search", "프라이머 AI SaaS Seed Pre-A 투자사", "--db", dbPath, "--json"]);
    assert.ok(search.results.length >= 1);
    assert.equal(search.results[0].evidence_status, "verified_official");
    assert.equal(search.results[0].resolution_status, "resolved_exact");
    assert.ok(search.results[0].source_trust_tier);
    assert.equal(search.results[0].authority_role, "authoritative");
    assert.ok(search.results[0].authority_scope);
    assert.ok(search.results[0].why_ranked.length >= 1);
    assert.ok(search.data_gaps.some((gap) => gap.includes("official_disclosure_documents")));

    const health = runJson(["health", "--db", dbPath, "--json"]);
    const kvic = health.sources.find((source) => source.source_id === "kvic_fundfinder");
    assert.equal(kvic.successful_runs, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("stdio MCP supports initialize, tools/list, and search_vc_database", async () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-mcp-"));
  const dbPath = join(dir, "vc-funds.sqlite");
  try {
    run(["setup", "--db", dbPath, "--json"]);
    run(["load-sql", fixtureSql, "--db", dbPath, "--json"]);

    const server = spawn(process.execPath, [binPath, "mcp", "serve", "--db", dbPath], {
      stdio: ["pipe", "pipe", "pipe"]
    });
    const readNext = createLineReader(server.stdout);

    server.stdin.write(`${JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "node-test", version: "0.0.0" }
      }
    })}\n`);
    const init = await readNext();
    assert.equal(init.result.protocolVersion, "2025-06-18");

    server.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`);
    server.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })}\n`);
    const tools = await readNext();
    assert.ok(tools.result.tools.some((tool) => tool.name === "search_vc_database"));
    assert.ok(tools.result.tools.some((tool) => tool.name === "import_kvic_snapshot"));
    assert.ok(tools.result.tools.some((tool) => tool.name === "import_kvca_snapshot"));

    server.stdin.write(`${JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "search_vc_database",
        arguments: { query: "프라이머 Seed AI SaaS", limit: 3 }
      }
    })}\n`);
    const call = await readNext();
    assert.equal(call.result.isError, false);
    assert.ok(call.result.structuredContent.results.length >= 1);
    assert.equal(call.result.structuredContent.results[0].evidence_status, "verified_official");

    server.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 4, method: "unknown/method", params: {} })}\n`);
    const unknownMethod = await readNext();
    assert.equal(unknownMethod.error.code, -32601);
    assert.match(unknownMethod.error.message, /Method not found/u);

    server.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "missing_tool", arguments: {} } })}\n`);
    const unknownTool = await readNext();
    assert.equal(unknownTool.error.code, -32602);
    assert.match(unknownTool.error.message, /Unknown tool/u);

    server.stdin.write(`${JSON.stringify({
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: { name: "search_vc_database", arguments: {} }
    })}\n`);
    const missingQuery = await readNext();
    assert.equal(missingQuery.error.code, -32602);
    assert.match(missingQuery.error.message, /query is required/u);

    server.stdin.write(`${JSON.stringify({
      jsonrpc: "2.0",
      id: 7,
      method: "tools/call",
      params: { name: "search_vc_database", arguments: { query: "프라이머", intent_hint: "bad_intent" } }
    })}\n`);
    const invalidIntent = await readNext();
    assert.equal(invalidIntent.error.code, -32602);
    assert.match(invalidIntent.error.message, /intent_hint must be one of/u);

    server.stdin.write(`${JSON.stringify({
      jsonrpc: "2.0",
      id: 8,
      method: "tools/call",
      params: { name: "import_kvca_snapshot", arguments: { file_path: kvcaFixture } }
    })}\n`);
    const outsideRootImport = await readNext();
    assert.equal(outsideRootImport.error.code, -32602);
    assert.match(outsideRootImport.error.message, /outside allowed import roots/u);

    server.stdin.write(`${JSON.stringify({
      jsonrpc: "2.0",
      id: 9,
      method: "tools/call",
      params: { name: "import_kvca_snapshot", arguments: { file_path: join(dir, "missing.csv") } }
    })}\n`);
    const missingFileImport = await readNext();
    assert.equal(missingFileImport.error.code, -32602);
    assert.match(missingFileImport.error.message, /no such file or directory|ENOENT/u);

    server.kill();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

function run(args) {
  const result = spawnSync(process.execPath, [binPath, ...args], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout;
}

function runJson(args) {
  return JSON.parse(run(args));
}

function createLineReader(stream) {
  let buffer = "";
  const waiters = [];

  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    buffer += chunk;
    flush();
  });

  return function readNext() {
    return new Promise((resolveLine, reject) => {
      waiters.push({ resolveLine, reject });
      flush();
    });
  };

  function flush() {
    while (waiters.length > 0) {
      const newline = buffer.indexOf("\n");
      if (newline < 0) return;
      const line = buffer.slice(0, newline);
      buffer = buffer.slice(newline + 1);
      const waiter = waiters.shift();
      try {
        waiter.resolveLine(JSON.parse(line));
      } catch (error) {
        waiter.reject(error);
      }
    }
  }
}
