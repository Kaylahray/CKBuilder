import * as bindings from "@ckb-js-std/bindings";
import { HighLevel } from "@ckb-js-std/core";

// ──────────────────────────────────────────────
// Profile Registry – Type Script for CKB
//
// Think of this as the "LinkedIn profile cell" guard.
// Each user can mint one profile cell, update it (same lock), or burn it.
// Transferring the profile to a different owner is blocked.
//
// Cell data format (UTF-8 JSON):
//   { "name": "Alice", "bio": "...", "skills": [...], "avatar": "..." }
//   Only `name` is required. Max name length = 64 chars.
// ──────────────────────────────────────────────

enum ExitCode {
  Success = 0,
  EmptyGroup = 40,
  InvalidCardinality = 41,
  OwnershipChanged = 42,
  InvalidProfileData = 43,
  SyscallFailure = 50,
}

function isIndexOutOfBound(err: any): boolean {
  return (
    err?.errorCode === bindings.INDEX_OUT_OF_BOUND ||
    err?.errorCode === 1
  );
}

function hasGroupCell(index: number, source: bindings.SourceType): boolean {
  try {
    HighLevel.loadCell(index, source);
    return true;
  } catch (err: any) {
    if (isIndexOutOfBound(err)) return false;
    throw err;
  }
}

function equalBytes(a: ArrayBuffer, b: ArrayBuffer): boolean {
  const ua = new Uint8Array(a);
  const ub = new Uint8Array(b);
  if (ua.length !== ub.length) return false;
  for (let i = 0; i < ua.length; i++) {
    if (ua[i] !== ub[i]) return false;
  }
  return true;
}

// Decode an ArrayBuffer as UTF-8 text.
function decodeAscii(buf: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buf);
  let str = "";
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] > 0x7f) {
      return null;
    }
    str += String.fromCharCode(bytes[i]);
  }
  return str;
}

// Validate the profile JSON in the output cell data.
// Returns true only if the data contains a valid `name` field.
function validateProfileData(index: number, source: bindings.SourceType): boolean {
  try {
    const raw = bindings.loadCellData(index, source);
    if (!raw || raw.byteLength === 0) return false;

    const text = decodeAscii(raw);
    if (text === null) return false;
    const profile = JSON.parse(text);

    if (typeof profile !== "object" || profile === null) return false;

    const name: unknown = profile.name;
    if (typeof name !== "string") return false;
    if (name.trim().length === 0) return false;
    if (name.length > 64) return false;

    return true;
  } catch (_) {
    return false;
  }
}

function validateProfileRegistry(): number {
  try {
    const hasIn0 = hasGroupCell(0, bindings.SOURCE_GROUP_INPUT);
    const hasOut0 = hasGroupCell(0, bindings.SOURCE_GROUP_OUTPUT);
    const hasIn1 = hasGroupCell(1, bindings.SOURCE_GROUP_INPUT);
    const hasOut1 = hasGroupCell(1, bindings.SOURCE_GROUP_OUTPUT);

    // Only one cell per group is allowed.
    if (hasIn1 || hasOut1) {
      return ExitCode.InvalidCardinality;
    }

    // There must be at least one side.
    if (!hasIn0 && !hasOut0) {
      return ExitCode.EmptyGroup;
    }

    // Mint path: creating a new profile.
    if (!hasIn0 && hasOut0) {
      if (!validateProfileData(0, bindings.SOURCE_GROUP_OUTPUT)) {
        return ExitCode.InvalidProfileData;
      }
      return ExitCode.Success;
    }

    // Burn path: deleting the profile.
    if (hasIn0 && !hasOut0) {
      return ExitCode.Success;
    }

    // Update path: check ownership has not changed.
    const inLockHash = HighLevel.loadCellLockHash(0, bindings.SOURCE_GROUP_INPUT);
    const outLockHash = HighLevel.loadCellLockHash(0, bindings.SOURCE_GROUP_OUTPUT);

    if (!equalBytes(inLockHash, outLockHash)) {
      return ExitCode.OwnershipChanged;
    }

    // Validate updated profile data.
    if (!validateProfileData(0, bindings.SOURCE_GROUP_OUTPUT)) {
      return ExitCode.InvalidProfileData;
    }

    return ExitCode.Success;
  } catch (_) {
    return ExitCode.SyscallFailure;
  }
}

bindings.exit(validateProfileRegistry());
