import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  DEFAULT_SCRIPT_ALWAYS_SUCCESS,
  DEFAULT_SCRIPT_CKB_JS_VM,
  Resource,
  Verifier,
} from "ckb-testtool";
import {
  Script,
  Transaction,
  bytesConcat,
  bytesFrom,
  hashTypeToBytes,
  hexFrom,
} from "@ckb-ccc/core";

const EXIT_INVALID_CARDINALITY = 41;
const EXIT_OWNERSHIP_CHANGED = 42;
const EXIT_INVALID_PROFILE_DATA = 43;

function asciiToHex(text: string): `0x${string}` {
  return (`0x${Buffer.from(text, "utf8").toString("hex")}`) as `0x${string}`;
}

function getContractBytecodePath(): string {
  return join(__dirname, "..", "dist", "index.bc");
}

function createProfileTypeScript(resource: Resource, tx: Transaction): Script {
  const vmScript = resource.deployCell(
    hexFrom(readFileSync(DEFAULT_SCRIPT_CKB_JS_VM)),
    tx,
    false,
  );

  const bytecodePath = getContractBytecodePath();
  if (!existsSync(bytecodePath)) {
    throw new Error("Missing dist/index.bc. Run npm run build:bc before tests.");
  }

  const jsCodeScript = resource.deployCell(
    hexFrom(readFileSync(bytecodePath)),
    tx,
    false,
  );

  const loaderArgs = hexFrom(
    bytesConcat(
      "0x0000",
      bytesFrom(jsCodeScript.codeHash),
      hashTypeToBytes(jsCodeScript.hashType),
    ),
  );

  return new Script(vmScript.codeHash, vmScript.hashType, loaderArgs);
}

function createOwnerLock(
  resource: Resource,
  tx: Transaction,
  ownerArg: `0x${string}`,
): Script {
  const alwaysSuccessLock = resource.deployCell(
    hexFrom(readFileSync(DEFAULT_SCRIPT_ALWAYS_SUCCESS)),
    tx,
    false,
  );
  return new Script(
    alwaysSuccessLock.codeHash,
    alwaysSuccessLock.hashType,
    ownerArg,
  );
}

describe("profile registry type script", () => {
  test("mint succeeds with valid profile JSON", async () => {
    const resource = Resource.default();
    const tx = Transaction.default();

    const profileType = createProfileTypeScript(resource, tx);
    const ownerA = createOwnerLock(resource, tx, "0x01");

    tx.outputs.push(Resource.createCellOutput(ownerA, profileType));
    tx.outputsData.push(asciiToHex('{"name":"alice","bio":"ckb"}'));

    const verifier = Verifier.from(resource, tx);
    await verifier.verifySuccess();
  });

  test("mint fails with invalid profile JSON", async () => {
    const resource = Resource.default();
    const tx = Transaction.default();

    const profileType = createProfileTypeScript(resource, tx);
    const ownerA = createOwnerLock(resource, tx, "0x01");

    tx.outputs.push(Resource.createCellOutput(ownerA, profileType));
    tx.outputsData.push(asciiToHex('{"bio":"missing-name"}'));

    const verifier = Verifier.from(resource, tx);
    await verifier.verifyFailure(EXIT_INVALID_PROFILE_DATA);
  });

  test("update succeeds when owner unchanged and profile valid", async () => {
    const resource = Resource.default();
    const tx = Transaction.default();

    const profileType = createProfileTypeScript(resource, tx);
    const ownerA = createOwnerLock(resource, tx, "0x01");

    const inputCell = resource.mockCell(
      ownerA,
      profileType,
      asciiToHex('{"name":"alice","bio":"v1"}'),
    );
    tx.inputs.push(Resource.createCellInput(inputCell));

    tx.outputs.push(Resource.createCellOutput(ownerA, profileType));
    tx.outputsData.push(asciiToHex('{"name":"alice","bio":"v2"}'));

    const verifier = Verifier.from(resource, tx);
    await verifier.verifySuccess();
  });

  test("transfer fails when ownership changes", async () => {
    const resource = Resource.default();
    const tx = Transaction.default();

    const profileType = createProfileTypeScript(resource, tx);
    const ownerA = createOwnerLock(resource, tx, "0x01");
    const ownerB = createOwnerLock(resource, tx, "0x02");

    const inputCell = resource.mockCell(
      ownerA,
      profileType,
      asciiToHex('{"name":"alice"}'),
    );
    tx.inputs.push(Resource.createCellInput(inputCell));

    tx.outputs.push(Resource.createCellOutput(ownerB, profileType));
    tx.outputsData.push(asciiToHex('{"name":"alice"}'));

    const verifier = Verifier.from(resource, tx);
    await verifier.verifyFailure(EXIT_OWNERSHIP_CHANGED);
  });

  test("fails with invalid cardinality for >1 group output", async () => {
    const resource = Resource.default();
    const tx = Transaction.default();

    const profileType = createProfileTypeScript(resource, tx);
    const ownerA = createOwnerLock(resource, tx, "0x01");

    tx.outputs.push(Resource.createCellOutput(ownerA, profileType));
    tx.outputsData.push(asciiToHex('{"name":"alice"}'));
    tx.outputs.push(Resource.createCellOutput(ownerA, profileType));
    tx.outputsData.push(asciiToHex('{"name":"alice2"}'));

    const verifier = Verifier.from(resource, tx);
    await verifier.verifyFailure(EXIT_INVALID_CARDINALITY);
  });
});
