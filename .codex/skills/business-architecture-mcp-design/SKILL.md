---
name: business-architecture-mcp-design
description: Use when designing or refining an MCP/CLI/data product from a README, GitHub project, or product idea by extracting the business pain point, mapping it to architecture, and updating project specs. Trigger for requests mentioning README analysis, business problem, problem-solution fit, MCP architecture, CLI design, source-backed product architecture, schoolinfo-mcp-style design, evidence databases, local/remote MCP boundaries, or turning a reference project into reusable implementation guidance.
---

# Business Architecture MCP Design

Use this skill to turn a reference product or README into an implementation-ready MCP/CLI architecture. The goal is not to summarize the reference; it is to identify the user pain, show how the architecture solves it, and update this project with reusable specs.

## Workflow

1. **Read The Product Promise**
   - If the user references a GitHub project or external README, browse it and read the README plus the smallest set of source files needed to confirm the architecture.
   - Extract the user, painful job, hidden or fragmented data, desired outcome, and why existing workflows fail.
   - Capture the product promise in one sentence.

2. **Map Problem To Architecture**
   - Build a table: `business problem -> product promise -> architecture mechanism`.
   - Identify which parts are core logic, which are transport adapters, which are data models, and which are safety or validation gates.
   - Prefer architecture that directly follows the pain point. Avoid generic MCP boilerplate.

3. **Design The User Surface First**
   - Define the simplest user-facing promise and examples before naming modules.
   - Separate surfaces: CLI, local MCP, remote MCP, web app, reports, exports.
   - Keep CLI/MCP/web as thin adapters over shared core logic.
   - Make local-only tools explicit. File-path import/parse tools belong in local stdio MCP, not remote MCP.

4. **Preserve Evidence And Accuracy**
   - Store raw artifacts before normalized rows.
   - Require source URL, hash, imported/captured time, parser status, and caveats.
   - Distinguish official evidence, guide/education material, user notes, and inferred recommendations.
   - For search products, define `why_ranked`, `evidence_status`, data gaps, and recommended imports.

5. **Update Project Specs**
   - In this repo, prefer updating `startup-fundraise/mcp/vc-fund-disclosure/` for VC Funds MCP design.
   - Keep the SOT agent and connector docs linked to any new spec files.
   - Do not register fake MCP servers in `.mcp.json` before an executable exists.

6. **Validate**
   - Validate YAML, SQL, Markdown code fences, internal links, and `git diff --check`.
   - If SQL specs changed, run the SQLite schema/seed/display/quality query pack.
   - Report remaining gaps honestly.

## Reference

Read `references/business-problem-architecture-map.md` when the task asks for a deeper README/business-problem analysis, schoolinfo-mcp comparison, or a reusable MCP/CLI implementation plan.
