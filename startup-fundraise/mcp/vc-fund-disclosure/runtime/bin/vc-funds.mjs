#!/usr/bin/env node
import { VcFundsCore } from "../src/core.mjs";
import { DEFAULT_DB_PATH, expandPath, loadSqlFile } from "../src/sqlite.mjs";
import { serveMcpStdio } from "../src/mcp-stdio.mjs";

const args = process.argv.slice(2);

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

async function main() {
  const command = args[0] || "help";
  const rest = args.slice(1);
  const options = parseOptions(rest);
  const dbPath = expandPath(options.db || DEFAULT_DB_PATH);
  const core = new VcFundsCore({ dbPath });

  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "setup" || command === "init") {
    output(core.setup(), options);
    return;
  }

  if (command === "doctor") {
    output(core.doctor(), options);
    return;
  }

  if (command === "sources") {
    output(core.getSourceAuthority({ intentOrClaimType: options.scope || options.intent }), options);
    return;
  }

  if (command === "health") {
    output(core.getCollectionHealth({ includeDisabled: options.includeDisabled !== false }), options);
    return;
  }

  if (command === "resolve") {
    const query = positional(options).join(" ");
    output(core.resolveUserInput({ query, includeAmbiguousCandidates: options.ambiguous !== false }), options);
    return;
  }

  if (command === "search") {
    const query = positional(options).join(" ");
    output(
      core.searchVcDatabase({
        query,
        intentHint: options.intent,
        limit: Number(options.limit || 10)
      }),
      options
    );
    return;
  }

  if (command === "import") {
    const importKind = positional(options)[0];
    if (importKind === "kvic") {
      output(core.importKvicSnapshot(importOptions(options)), options);
      return;
    }
    if (importKind === "kvca") {
      output(core.importKvcaSnapshot(importOptions(options)), options);
      return;
    }
    throw new Error("import requires a source kind: kvic or kvca");
  }

  if (command === "load-sql") {
    const filePath = positional(options)[0];
    if (!filePath) throw new Error("load-sql requires a SQL file path");
    loadSqlFile(dbPath, filePath);
    output({ ok: true, dbPath, loaded: filePath }, options);
    return;
  }

  if (command === "mcp" && rest[0] === "serve") {
    serveMcpStdio({ dbPath });
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

function parseOptions(argv) {
  const options = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      options._.push(arg);
      continue;
    }
    const key = toCamel(arg.slice(2));
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      options[key] = true;
    } else {
      options[key] = next;
      i += 1;
    }
  }
  return options;
}

function positional(options) {
  return options._ ?? [];
}

function toCamel(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function output(value, options) {
  if (options.json) {
    console.log(JSON.stringify(value, null, 2));
    return;
  }
  console.log(render(value));
}

function importOptions(options) {
  return {
    file: options.file,
    sourceUrl: options.sourceUrl,
    capturedAt: options.capturedAt,
    group: options.group,
    code: options.code,
    category: options.category,
    vcName: options.vcName,
    enforceAllowedRoots: false
  };
}

function render(value) {
  if (Array.isArray(value)) return value.map(render).join("\n");
  if (value && typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value ?? "");
}

function printHelp() {
  console.log(`vc-funds draft runtime

Usage:
  vc-funds setup --db <path> [--json]
  vc-funds doctor --db <path> [--json]
  vc-funds sources --scope <claim_type> --db <path> [--json]
  vc-funds health --db <path> [--json]
  vc-funds resolve "프라이머 Seed 펀드" --db <path> [--json]
  vc-funds search "AI SaaS Seed Pre-A 투자사" --db <path> [--json]
  vc-funds import kvic --file ./fundfinder.html --source-url <url> --captured-at <iso> --db <path> [--json]
  vc-funds import kvca --file ./kvca.csv --source-url <url> --captured-at <iso> --db <path> [--json]
  vc-funds mcp serve --db <path>

Draft scope:
  - no background crawler
  - HTML and CSV import only; XLS/XLSX returns unsupported_format
  - no paid API dependency
  - local SQLite evidence database only
`);
}
