# username-registry-real

Name-cell style username registry contract workspace (v2).

## What this enforces on-chain

- canonical username format: lowercase `a-z`, digits `0-9`, underscore `_`
- 3 to 32 chars
- one cell per type-script group in tx
- immutable username bytes on update
- non-transferable ownership lock on update

## Build and test

```bash
npm install
npm run build:bc
npm test
```

## Deploy

Deploy the produced `dist/index.bc` with your normal offckb flow:

```bash
offckb deploy --target dist/index.bc --type-id --network testnet
```

Then copy the new deployment outputs into frontend env:

- `NEXT_PUBLIC_USERNAME_TYPE_ARGS`
- `NEXT_PUBLIC_USERNAME_BYTECODE_TX_HASH`
- `NEXT_PUBLIC_USERNAME_BYTECODE_INDEX`
- `NEXT_PUBLIC_USERNAME_BYTECODE_DEP_TYPE`

> Note: Full trustless global uniqueness needs protocol-level name-slot/global-state
> architecture. This v2 keeps strict name-cell invariants and canonicalization.
