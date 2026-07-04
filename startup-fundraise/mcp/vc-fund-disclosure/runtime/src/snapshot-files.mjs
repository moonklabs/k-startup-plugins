import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, realpathSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, extname, resolve, sep } from "node:path";

export const DEFAULT_IMPORT_ROOT = resolve(homedir(), "Documents/MoonkLabs/VC Disclosures");
export const DEFAULT_IMPORT_ROOTS = [DEFAULT_IMPORT_ROOT];
export const SNAPSHOT_MAX_BYTES = 50 * 1024 * 1024;

const FORMAT_BY_EXTENSION = {
  ".csv": { format: "csv", contentType: "text/csv", supported: true },
  ".htm": { format: "html", contentType: "text/html", supported: true },
  ".html": { format: "html", contentType: "text/html", supported: true },
  ".xls": { format: "xls", contentType: "application/vnd.ms-excel", supported: false },
  ".xlsx": {
    format: "xlsx",
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    supported: false
  }
};

export function sha256Hex(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function detectSnapshotFormat(filePath) {
  const extension = extname(String(filePath || "")).toLowerCase();
  const detected = FORMAT_BY_EXTENSION[extension];
  if (detected) {
    return {
      extension,
      ...detected,
      unsupportedReason: detected.supported
        ? null
        : `${detected.format} requires a spreadsheet parser; export the official snapshot as HTML or CSV for this draft runtime.`
    };
  }

  return {
    extension,
    format: "unknown",
    contentType: "application/octet-stream",
    supported: false,
    unsupportedReason: "Only HTML and CSV snapshots are supported in this draft runtime."
  };
}

export function readSnapshotFile(filePath, options = {}) {
  const policy = importPathPolicy(options);
  const resolvedPath = resolve(filePath);
  const metadata = statSync(resolvedPath);
  if (!metadata.isFile()) {
    throw new Error(`Snapshot path is not a file: ${resolvedPath}`);
  }
  if (metadata.size > policy.maxBytes) {
    throw new Error(`Snapshot file exceeds ${policy.maxBytes} byte limit: ${resolvedPath}`);
  }
  validateSnapshotPath(resolvedPath, policy);

  const buffer = readFileSync(resolvedPath);
  const detected = detectSnapshotFormat(resolvedPath);
  const contentSha256 = sha256Hex(buffer);

  return {
    path: resolvedPath,
    fileName: basename(resolvedPath),
    format: detected.format,
    contentType: detected.contentType,
    supported: detected.supported,
    unsupportedReason: detected.unsupportedReason,
    contentSha256,
    byteLength: buffer.length,
    modifiedAt: metadata.mtime.toISOString(),
    text: detected.supported ? buffer.toString("utf8") : null
  };
}

export function importPathPolicy(options = {}) {
  return {
    enforceAllowedRoots: options.enforceAllowedRoots !== false,
    allowedRoots: normalizeAllowedRoots(options.allowedRoots),
    maxBytes: Number(options.maxBytes || SNAPSHOT_MAX_BYTES)
  };
}

function validateSnapshotPath(resolvedPath, policy) {
  const lstat = lstatSync(resolvedPath);
  if (lstat.isSymbolicLink()) {
    throw new Error(`Snapshot import rejects symbolic links: ${resolvedPath}`);
  }
  const realPath = realpathSync(resolvedPath);
  if (hasHiddenPathSegment(realPath)) {
    throw new Error(`Snapshot import rejects hidden files: ${resolvedPath}`);
  }

  if (!policy.enforceAllowedRoots) return;

  const allowed = policy.allowedRoots.some((root) => pathIsInside(realPath, root));
  if (!allowed) {
    throw new Error(`Snapshot path is outside allowed import roots: ${resolvedPath}`);
  }
}

function normalizeAllowedRoots(roots = DEFAULT_IMPORT_ROOTS) {
  return roots.map((root) => {
    const resolved = resolve(root);
    return existsSync(resolved) ? realpathSync(resolved) : resolved;
  });
}

function pathIsInside(realPath, root) {
  return realPath === root || realPath.startsWith(`${root}${sep}`);
}

function hasHiddenPathSegment(realPath) {
  return realPath.split(sep).some((part) => part.startsWith("."));
}
