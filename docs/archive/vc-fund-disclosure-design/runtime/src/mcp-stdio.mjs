import { CANONICAL_QUERY_INTENTS, VcFundsCore } from "./core.mjs";

export const MCP_PROTOCOL_VERSION = "2025-06-18";

export const TOOLS = [
  {
    name: "resolve_user_input",
    title: "Resolve VC Fund Query",
    description: "Resolve a natural-language startup fundraising query into intent, entity candidates, conditions, and required sources.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        company_context: { type: "object" },
        include_ambiguous_candidates: { type: "boolean", default: true }
      },
      required: ["query"]
    }
  },
  {
    name: "get_source_authority",
    title: "Get Source Authority",
    description: "Show which local source families are authoritative, supporting, or context-only for a claim type.",
    inputSchema: {
      type: "object",
      properties: {
        intent_or_claim_type: { type: "string" }
      }
    }
  },
  {
    name: "search_vc_database",
    title: "Search VC Fund Database",
    description: "Search local VC/AC fund, disclosure, event, and founder-guide evidence with status, caveats, and import gaps.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        company_context: { type: "object" },
        intent_hint: { type: "string", enum: CANONICAL_QUERY_INTENTS },
        limit: { type: "number", default: 10 }
      },
      required: ["query"]
    }
  },
  {
    name: "get_collection_health",
    title: "Get Collection Health",
    description: "List source collection state, policy status, trust tier, and open quality flags.",
    inputSchema: {
      type: "object",
      properties: {
        include_disabled: { type: "boolean", default: true }
      }
    }
  },
  {
    name: "import_kvic_snapshot",
    title: "Import KVIC FundFinder Snapshot",
    description:
      "Import a user-saved KVIC FundFinder HTML or CSV snapshot from allowed local import roots only. XLS/XLSX returns unsupported_format.",
    inputSchema: {
      type: "object",
      properties: {
        file_path: { type: "string" },
        source_url: { type: "string" },
        captured_at: { type: "string" },
        group_code: { type: "string" },
        subcategory_code: { type: "string" }
      },
      required: ["file_path"]
    }
  },
  {
    name: "import_kvca_snapshot",
    title: "Import KVCA DIVA Association Snapshot",
    description:
      "Import a user-saved KVCA DIVA association HTML or CSV snapshot from allowed local import roots only. XLS/XLSX returns unsupported_format.",
    inputSchema: {
      type: "object",
      properties: {
        file_path: { type: "string" },
        source_url: { type: "string" },
        captured_at: { type: "string" },
        vc_name: { type: "string" }
      },
      required: ["file_path"]
    }
  }
];

export function serveMcpStdio({ dbPath }) {
  const core = new VcFundsCore({ dbPath });
  process.stdin.setEncoding("utf8");
  let buffer = "";

  process.stdin.on("data", (chunk) => {
    buffer += chunk;
    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      newlineIndex = buffer.indexOf("\n");
      if (!line) continue;
      handleLine(core, line);
    }
  });
}

function handleLine(core, line) {
  let message;
  try {
    message = JSON.parse(line);
  } catch (error) {
    writeError(null, -32700, `Parse error: ${error.message}`);
    return;
  }

  if (!message.id && message.method?.startsWith("notifications/")) {
    return;
  }

  try {
    const result = dispatch(core, message);
    if (message.id !== undefined) writeResult(message.id, result);
  } catch (error) {
    writeError(message.id ?? null, jsonRpcErrorCode(error), error.message);
  }
}

function dispatch(core, message) {
  switch (message.method) {
    case "initialize":
      return {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: {
          tools: { listChanged: false }
        },
        serverInfo: {
          name: "vc-fund-disclosure",
          title: "VC Fund Disclosure Local MCP",
          version: "0.0.0-draft"
        },
        instructions:
          "Use search_vc_database for local VC/AC fund evidence. Treat guide results as education, not official fund proof."
      };
    case "ping":
      return {};
    case "tools/list":
      return { tools: TOOLS };
    case "tools/call":
      return callTool(core, message.params ?? {});
    default:
      throw Object.assign(new Error(`Method not found: ${message.method}`), { code: -32601 });
  }
}

function callTool(core, params) {
  const name = params.name;
  const args = params.arguments ?? {};
  let structuredContent;

  try {
    switch (name) {
      case "resolve_user_input":
        structuredContent = core.resolveUserInput({
          query: args.query,
          companyContext: args.company_context,
          includeAmbiguousCandidates: args.include_ambiguous_candidates !== false
        });
        break;
      case "get_source_authority":
        structuredContent = core.getSourceAuthority({ intentOrClaimType: args.intent_or_claim_type });
        break;
      case "search_vc_database":
        structuredContent = core.searchVcDatabase({
          query: args.query,
          companyContext: args.company_context,
          intentHint: args.intent_hint,
          limit: args.limit ?? 10
        });
        break;
      case "get_collection_health":
        structuredContent = core.getCollectionHealth({ includeDisabled: args.include_disabled !== false });
        break;
      case "import_kvic_snapshot":
        structuredContent = core.importKvicSnapshot({
          file: args.file_path,
          sourceUrl: args.source_url,
          capturedAt: args.captured_at,
          group: args.group_code,
          code: args.subcategory_code
        });
        break;
      case "import_kvca_snapshot":
        structuredContent = core.importKvcaSnapshot({
          file: args.file_path,
          sourceUrl: args.source_url,
          capturedAt: args.captured_at,
          vcName: args.vc_name
        });
        break;
      default:
        throw Object.assign(new Error(`Unknown tool: ${name}`), { code: -32602 });
    }
  } catch (error) {
    if (isInvalidParamsError(error)) {
      throw Object.assign(error, { code: -32602 });
    }
    throw error;
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(structuredContent, null, 2)
      }
    ],
    structuredContent,
    isError: false
  };
}

function isInvalidParamsError(error) {
  if ([-32601, -32602, -32603].includes(error.code)) return false;
  if (["ENOENT", "ENOTDIR", "EISDIR"].includes(error.code)) return true;
  return /query is required|intent_hint must be one of|import requires --file|Snapshot path is not a file|Snapshot file exceeds|Snapshot import rejects symbolic links|Snapshot import rejects hidden files|Snapshot path is outside allowed import roots/u.test(error.message ?? "");
}

function jsonRpcErrorCode(error) {
  if (isInvalidParamsError(error)) return -32602;
  return typeof error.code === "number" ? error.code : -32603;
}

function writeResult(id, result) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`);
}

function writeError(id, code, message) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } })}\n`);
}
