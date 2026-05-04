import * as bindings from "@ckb-js-std/bindings";
import { HighLevel } from "@ckb-js-std/core";

// Name-cell v2 contract:
// - one username cell per type-script group in tx
// - mint: output-only, valid canonical username required
// - burn: input-only, allowed
// - update: lock hash and username bytes must remain unchanged
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
  return err?.errorCode === bindings.INDEX_OUT_OF_BOUND || err?.errorCode === 1;
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
    if (bytes[i] > 0x7f) return null;
    str += String.fromCharCode(bytes[i]);
  }
  return str;
}

// Canonical rule in v2: lowercase letters, digits, underscore only.
function isValidUsername(username: string): boolean {
  if (username.length < 3 || username.length > 32) return false;
  return /^[a-z0-9_]+$/.test(username);
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

function validateNameCell(): number {
  try {
    const hasIn0 = hasGroupCell(0, bindings.SOURCE_GROUP_INPUT);
    const hasOut0 = hasGroupCell(0, bindings.SOURCE_GROUP_OUTPUT);
    const hasIn1 = hasGroupCell(1, bindings.SOURCE_GROUP_INPUT);
    const hasOut1 = hasGroupCell(1, bindings.SOURCE_GROUP_OUTPUT);

    if (hasIn1 || hasOut1) return ExitCode.InvalidCardinality;
    if (!hasIn0 && !hasOut0) return ExitCode.EmptyGroup;

    // Mint
    if (!hasIn0 && hasOut0) {
      const username = readUsername(0, bindings.SOURCE_GROUP_OUTPUT);
      if (username === null || !isValidUsername(username)) {
        return ExitCode.InvalidUsername;
      }
      return ExitCode.Success;
    }

    // Burn
    if (hasIn0 && !hasOut0) return ExitCode.Success;

    // Update path is deliberately immutable/non-transferable.
    const inLockHash = HighLevel.loadCellLockHash(0, bindings.SOURCE_GROUP_INPUT);
    const outLockHash = HighLevel.loadCellLockHash(0, bindings.SOURCE_GROUP_OUTPUT);
    if (!equalBytes(inLockHash, outLockHash)) return ExitCode.OwnershipChanged;

    const inData = bindings.loadCellData(0, bindings.SOURCE_GROUP_INPUT);
    const outData = bindings.loadCellData(0, bindings.SOURCE_GROUP_OUTPUT);
    if (!equalBytes(inData, outData)) return ExitCode.UsernameChanged;

    return ExitCode.Success;
  } catch (_) {
    return ExitCode.SyscallFailure;
  }
}

bindings.exit(validateNameCell());
