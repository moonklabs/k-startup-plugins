# Business Problem To MCP Architecture Map

Use this reference when translating a product README or reference GitHub project into an MCP/CLI architecture.

## Analysis Frame

Ask these questions in order:

1. Who is the non-expert user?
2. What data already exists but is hard to use?
3. Where is the important information hidden: codes, fragmented sites, files, PDFs, HWP/HWPX, login products, or internal notes?
4. What does the user want to ask in natural language?
5. What must the system infer or resolve internally?
6. What is the trustworthy output: table, report, checklist, evidence pack, alert, export?
7. What must be local-only for security or policy reasons?
8. What proof must each answer carry?

## Mapping Template

```markdown
| Business Problem | Product Promise | Architecture Mechanism | Validation |
|---|---|---|---|
| Data exists but users cannot find it | Ask by natural language | intent extraction + search adapter | fixture query returns expected results |
| Codes/IDs are unknown | User does not need codes | alias/code resolver | ambiguous input returns candidates |
| Key info is inside files | Show structured tables | document parser + raw artifact store | parser golden tests |
| Results must be trusted | Show official evidence | source URL + hash + parser warning | response includes evidence fields |
| Remote file access is unsafe | Local-only import tools | `localFiles` transport gate | remote MCP omits file tools |
```

## Schoolinfo-MCP Pattern

Schoolinfo-MCP works because its README names a real pain: school disclosure data exists, but parents do not know where to find it, and the most important evaluation plans are buried in HWP/PDF attachments.

Architectural lessons:

- Use a simple user promise: "do not search, ask."
- Hide official codes and identifiers behind resolvers.
- Combine structured public data and attachment parsing in one product experience.
- Let CLI, local MCP, remote MCP, and web use shared core logic.
- Gate local file parsing with a transport option such as `localFiles`.
- Return comparison-ready tables, not raw API payloads.
- Prefer safe candidate lists and caveats over false precision.

## VC Funds MCP Application

Equivalent pain:

- Korean startup founders need to know which VC/AC has real fund evidence.
- Evidence is scattered across KVIC FundFinder, KVCA DIVA, TIPS, disclosures, PDFs/HWPX, and private notes.
- Founders do not know FundFinder codes, KVCA parameters, fund association types, or document parsing workflows.
- The correct product is not a scraper. It is an evidence-backed local query layer.

Architecture mapping:

| VC Funds Problem | Architecture |
|---|---|
| Fund evidence is fragmented | source registry + source-specific import adapters |
| Founders ask in natural language | intent extraction + FundFinder parameter catalog |
| VC names vary | investor alias normalization |
| Table data is incomplete | documents + event extraction + review queue |
| Recommendations need trust | ranking model + `evidence_status` + `why_ranked` |
| Data can be missing | `list_data_gaps` + recommended imports |
| Personal collection is local | local stdio MCP + watch folder + browser capture |
| Remote MCP must be safe | query-only remote with `localFiles=false` |

## Output Artifacts

For a serious task, produce or update:

- Business/problem analysis document.
- Implementation blueprint with module and transport boundaries.
- User-facing CLI/MCP usage document.
- Search/ranking contract.
- Tool contract.
- Schema/query/quality-check specs when data accuracy matters.
- SOT references from agent/connector docs.

## Quality Bar

Do not stop at "this project is similar." Show:

- The original business pain.
- The product promise.
- The architectural mechanism that fulfills each promise.
- The local vs remote security boundary.
- The proof each result carries.
- The validation commands run.
