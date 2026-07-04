export function parseSnapshotTable({ text, format }) {
  if (format === "csv") return parseCsvTable(text);
  if (format === "html") return parseHtmlTable(text);
  return {
    headers: [],
    rows: [],
    warnings: [`Unsupported snapshot format: ${format}`]
  };
}

export function parseCsvTable(text) {
  const records = parseCsvRecords(text);
  if (records.length === 0) {
    return { headers: [], rows: [], warnings: ["CSV snapshot has no rows."] };
  }

  const headers = records[0].map(cleanCell);
  const warnings = [];
  const rows = [];

  records.slice(1).forEach((record, offset) => {
    const rowIndex = offset + 2;
    if (record.every((cell) => cleanCell(cell) === "")) return;
    if (record.length !== headers.length) {
      warnings.push(`Row ${rowIndex} has ${record.length} cells but header has ${headers.length}.`);
    }
    rows.push(rowFromRecord(headers, record, rowIndex));
  });

  return { headers, rows, warnings };
}

export function parseCsvRecords(text = "") {
  const records = [];
  let record = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      record.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      record.push(cell);
      records.push(record);
      record = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || record.length > 0) {
    record.push(cell);
    records.push(record);
  }

  return records.filter((row) => row.some((cellValue) => cleanCell(cellValue) !== ""));
}

export function parseHtmlTable(text = "") {
  const tables = [...String(text).matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)];
  const warnings = [];
  if (tables.length === 0) {
    return { headers: [], rows: [], warnings: ["HTML snapshot has no table element."] };
  }

  for (let tableIndex = 0; tableIndex < tables.length; tableIndex += 1) {
    const records = parseHtmlTableRecords(tables[tableIndex][1]);
    if (records.length < 2) continue;
    const headers = records[0].map(cleanCell);
    const rows = records.slice(1).flatMap((record, offset) => {
      const rowIndex = offset + 2;
      if (record.every((cell) => cleanCell(cell) === "")) return [];
      if (record.length !== headers.length) {
        warnings.push(`Table ${tableIndex + 1} row ${rowIndex} has ${record.length} cells but header has ${headers.length}.`);
      }
      return [rowFromRecord(headers, record, rowIndex)];
    });
    if (headers.some(Boolean) && rows.length > 0) {
      return { headers, rows, warnings, tableIndex };
    }
  }

  return { headers: [], rows: [], warnings: ["HTML snapshot has no parseable table with headers and data rows."] };
}

function parseHtmlTableRecords(tableHtml) {
  return [...tableHtml.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((match) => {
      return [...match[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((cell) => cleanCell(decodeHtml(stripTags(cell[1]))));
    })
    .filter((row) => row.length > 0);
}

function rowFromRecord(headers, record, rowIndex) {
  const row = { _rowIndex: rowIndex };
  headers.forEach((header, index) => {
    if (!header) return;
    row[header] = cleanCell(record[index] ?? "");
  });
  if (record.length > headers.length) {
    row._extraCells = record.slice(headers.length).map(cleanCell).filter(Boolean);
  }
  return row;
}

function cleanCell(value) {
  return String(value ?? "")
    .replace(/\uFEFF/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value) {
  return String(value ?? "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ");
}

function decodeHtml(value) {
  return String(value ?? "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}
