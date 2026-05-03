import * as bindings from "@ckb-js-std/bindings";
import { HighLevel } from "@ckb-js-std/core";

// ──────────────────────────────────────────────
// Username Registry – Type Script for CKB
//
// Think of this as the "LinkedIn @handle" guard.
// A user claims a username by minting a username cell.
// The username is stored as raw UTF-8 bytes in cell data.
// Once set, the username is immutable and non-transferable.
//
// Cell data format: raw UTF-8 string, e.g. "alice_dev"
//   Rules:
//     - 3–32 characters
//     - Only a-z, A-Z, 0-9, underscore (_)
//     - Cannot be changed after mint (immutable handle)
// ──────────────────────────────────────────────

enum ExitCode {
  Success = 0,
  EmptyGroup = 40,
  InvalidCardinality = 41,
  OwnershipChanged = 42,
  InvalidUsername = 43,
  UsernameChanged = 44,
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

// Validate the username string stored in cell data.
function isValidUsername(username: string): boolean {
  if (username.length < 3 || username.length > 32) return false;
  // Only alphanumeric and underscore.
  return /^[a-zA-Z0-9_]+$/.test(username);
}

function readUsername(index: number, source: bindings.SourceType): string | null {
  try {
    const raw = bindings.loadCellData(index, source);
    if (!raw || raw.byteLength === 0) return null;
    return decodeAscii(raw);
  } catch (_) {
    return null;
  }
}

function validateUsernameRegistry(): number {
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

    // Mint path: claiming a new username.
    if (!hasIn0 && hasOut0) {
      const username = readUsername(0, bindings.SOURCE_GROUP_OUTPUT);
      if (username === null || !isValidUsername(username)) {
        return ExitCode.InvalidUsername;
      }
      return ExitCode.Success;
    }

    // Burn path: releasing the username cell.
    if (hasIn0 && !hasOut0) {
      return ExitCode.Success;
    }

    // Update path: check ownership and that username has NOT changed.
    const inLockHash = HighLevel.loadCellLockHash(0, bindings.SOURCE_GROUP_INPUT);
    const outLockHash = HighLevel.loadCellLockHash(0, bindings.SOURCE_GROUP_OUTPUT);

    if (!equalBytes(inLockHash, outLockHash)) {
      return ExitCode.OwnershipChanged;
    }

    // Username is immutable: input data must equal output data.
    const inData = bindings.loadCellData(0, bindings.SOURCE_GROUP_INPUT);
    const outData = bindings.loadCellData(0, bindings.SOURCE_GROUP_OUTPUT);

    if (!equalBytes(inData, outData)) {
      return ExitCode.UsernameChanged;
    }

    return ExitCode.Success;
  } catch (_) {
    return ExitCode.SyscallFailure;
  }
}

bindings.exit(validateUsernameRegistry());
