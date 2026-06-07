### CKB Builder Track Dev Log (Week 7)

- Name: Chioma Christopher
- Week Ending: 07-06-2026

### What I Explored

This week I studied the `RGB++` Protocol Light Paper and the official Resource Hub in depth. I already understood the big picture from my earlier `RGB++` reading -- isomorphic binding, RGBPP_lock, SPV, the SDK. What I still needed was to understand where the original RGB protocol breaks down in practice and exactly how `RGB++` fixes it, because I am planning to build BitProof: Bitcoin-backed badge DOBs on `RGB++` Spore, tied to trustless PROOF rewards on CKB.

I did not ship application code this week. Everything here is reading, notes, and mapping tools to my build plan.

### Why RGB++ Exists

RGB is an extension protocol based on single-use seals and client-side validation. It maps state changes to Bitcoin UTXO ownership and keeps state off the main Bitcoin chain. It works in theory, but the Light Paper lists problems that show up in real products:

**DA issues**

Ordinary users on simple wallets cannot store full transaction history or generate proofs for counterparties. Light clients struggle to prove anything in a transfer without someone else holding the archive.

**P2P network issues**

RGB transfers depend on a P2P layer separate from Bitcoin. Receivers often need to provide invoices or live UTXOs. Both parties need to be online and coordinated.

**Virtual machine issues**

RGB mainly uses AluVM. Compared to CKB-VM or familiar ecosystems, tooling is still less mature for everyday app development.

**Ownerless contract issues**

Public or shared contracts are hard when validation is client-side and scoped to individual UTXO histories.

These points connected to questions I had about whether rewards and credentials can truly live on-chain and stay with the right person. RGB puts a lot on the user. RGB++ moves much of that validation to CKB where scripts enforce rules publicly.

RGB++ does not replace Bitcoin. Bitcoin stays the ownership and settlement layer. CKB becomes execution and state management. No cross-chain bridges, no compromise on Bitcoin security.

### Client-Side Validation

RGB users validate only the UTXO branches that matter to them. State security does not depend on a centralized third party -- but the burden sits on each user to maintain and verify history.

RGB++ inherits this option. Users can still verify locally using UTXO history if they want. They are not forced to -- they can also read CKB transactions directly.

### Blockchain-Enhanced State Validation

All RGB++ transactions appear on both BTC and CKB. The BTC side stays compatible with RGB-style commitments. The CKB side replaces much of the client validation process.

Benefits include:

- On-chain verification of asset rules.
- Publicly auditable state transitions.
- Reduced burden on users.
- Simpler verification process.

Some advanced features like transaction folding still use CKB block headers for double-spend checks. The baseline UX is still much lighter than pure RGB.

The biggest difference I noticed is that RGB focuses on users performing validation, while RGB++ moves much of that responsibility to the blockchain.

### Single-Use Seals

Peter Todd proposed single-use seals in 2016 -- lock a message with an electronic seal that can only be opened once. RGB and RGB++ use Bitcoin UTXOs as those seals.

A UTXO can only be spent once. Bitcoin consensus prevents double-spending of the seal.

This means:

- Ownership of a Bitcoin UTXO equals ownership of the corresponding RGB++ asset.
- Spending the UTXO transfers the asset.
- You can trace UTXO branch history without unrelated Bitcoin activity.
- Double-spending protection is inherited directly from Bitcoin.

For BitProof badges, whoever holds the bound UTXO owns the badge. My app does not decide ownership -- Bitcoin does.

### Isomorphic Binding

The two pillars of RGB are UTXOs for ownership and commitments for state. RGB++ maps UTXOs one-to-one to CKB Cells.

Bitcoin controls:

- Ownership
- Settlement
- Security

CKB controls:

- Asset state
- Smart contract logic
- Application data
- Computation

RGBPP_lock args carry bitcoin transaction id and output index. State lives in cell data and type scripts. When the UTXO changes, the corresponding cell must update correctly or scripts reject the transaction.

BitProof badges will be Spores on CKB whose locks point at Bitcoin UTXOs.

### RGB++ Transaction Flow

Every RGB++ transaction involves both Bitcoin and CKB. The Light Paper breaks it into four phases:

**1. Off-chain computation**

- Select the next one-time seal to use.
- Build the CKB transaction off-chain.
- Compute commitment from the CKB transaction and relevant UTXOs.

**2. BTC transaction submission**

- Send a Bitcoin transaction.
- Consume the current ownership UTXO.
- Put commitment in OP_RETURN.

**3. CKB transaction submission**

- Submit the CKB transaction.
- Latest state lives in output cell data.
- The next change uses the new seal UTXO and new output.

**4. On-chain verification**

- Bitcoin verifies the UTXO was spent correctly.
- CKB Bitcoin light client verifies the BTC transaction exists.
- BTC tx data is submitted as witness on CKB.
- CKB checks commitment, correct UTXO spend, and cell transition rules.

One detail from the Script Standard I did not appreciate before: the BTC transaction cannot include the full CKB transaction hash if the CKB transaction depends on the BTC transaction. That creates a deadlock. Commitment only covers the first N typed inputs and outputs. Fee adjustment cells can sit outside. SDKs use that space to adjust fees.

### RGB++ Script System

I read the lockscript design document

### RGBPP_lock

RGBPP_lock is the ownership verification contract.

It binds a CKB Cell to a Bitcoin UTXO using:

- Bitcoin transaction ID
- Output index

During unlock, RGBPP_lock verifies:

- The Bitcoin transaction exists in the CKB Bitcoin light client.
- The correct UTXO was spent.
- Exactly one OP_RETURN carries a valid commitment.
- Commitment matches double sha256 of "RGB++" and message fields.
- inputs_len and outputs_len cover all typed cells.
- Ownership transitions are correct.

### BTC_TIME_lock

BTC_TIME_lock introduces a waiting period before assets become available after leaping from Bitcoin L1 to CKB L2.

Lock args include the recipient lock script, a minimum confirmation count, and a reference to the new bitcoin transaction. Examples use at least 6 confirmations before unlock. This protects against Bitcoin chain reorganizations.

BitProof badge minting on Signet is an L1 Spore operation. I follow the L1 transfer path -- not leap unlock flows.

### Config Cells

RGB++ uses Config Cells to store protocol configuration rather than hardcoding dependencies.

Configuration includes references to:

- Bitcoin light client type hash
- BTC_TIME_lock type hash

Code cell and config cell deploy in the same transaction. When contracts upgrade, config must upgrade under predefined rules too.

### L1 Transfer vs Leap

The script standard defines three patterns I need to keep straight:

- **L1 transfer** -- asset cells on inputs and outputs all use RGBPP_lock while operating on Bitcoin L1.
- **L1 to L2 leap** -- input uses RGBPP_lock; output uses BTC_TIME_lock until confirmations pass, then unlocks to a normal CKB lock.
- **L2 to L1 leap** -- no RGBPP_lock in inputs; outputs introduce RGBPP_lock bound to a new BTC UTXO.

BitProof stays on the L1 path for badge minting.

### Non-Interactive Transfers

Original RGB often requires the receiver to provide a live UTXO invoice while online. RGB++ supports send-then-claim:

- Sender transfers to the recipient's address without them being online.
- Recipient later builds a CKB transaction to unlock the cell to their own UTXO.

CKB lock scripts can verify signatures for the BTC address. That fits distributing achievement claims before users mint badges on their own schedule.

### Spore NFTs and BitProof

The Light Paper lists Spore, mNFT, and CoTA for RGB++ NFTs on CKB.

Spore keeps metadata on-chain with full data availability. That matches the handbook DOB path and my plan for BitProof badges as RGB++ Spores -- not an arbitrary choice.

NFT transfer on RGB++ is like coin transfer without change: one recipient UTXO maps to one shadow cell.

For BitProof specifically:

- PROOF rewards stay sUDT on CKB via my reward claim and treasury scripts.
- RGB++ Spore handles the achievement credential on Bitcoin.
- Single-use seals define who owns the badge after mint.
- Issuer creates claim cells on CKB; user redeems, then mints badge when ready.

### RGB++ Resource Hub

I spent time on the official RGB++ documentation site. The Resources section points to the Light Paper in English and Chinese, the RGB++ Explorer, and btc-assets-api -- those three are what I keep returning to.

Core Components covers two areas: the RGB++ Script Standard on the contract side, and CKB Bitcoin SPV as the light client bridge between chains.

Development Tools lists the current RGB++ SDK as Recommended and a Legacy SDK separately. I will use the recommended TypeScript SDK path.

There is also a community article on the hub about how CKB empowers Bitcoin asset protocols. It was useful alongside the Light Paper.

The hub publishes contract deployment references for Meepo Mainnet, Bitcoin Testnet3, and Bitcoin Signet -- code hash, tx hash, and dep type for both RGB++ Script and BTC_TIME_lock. BitProof setup targets Signet first.

Public Testnet3 API bases are listed for btc-assets-api. Signet uses its own service endpoint per the SDK documentation.

The RGB++ Explorer lets you search by address, transaction hash, block, or AssetID. That is where I will verify BitProof mints once I start building.

### btc-assets-api

btc-assets-api is the infrastructure service connecting applications to RGB++.

Its responsibilities include:

- Blockchain data retrieval -- chain info, blocks, transactions, addresses
- RGB++ asset retrieval by BTC address, UTXO, or tx id
- Transaction handling through the bitcoin and rgbpp CKB transaction endpoints
- RGB++ CKB transaction queue with cron jobs after BTC confirms
- SPV service integration for Bitcoin verification on CKB
- Paymaster support for CKB fees when users hold BTC-side UTXOs

Testnet3 and Signet public endpoints do not require access tokens. Mainnet requires approval from the RGB++ team.

For BitProof, the gallery will call this through the rgbpp-sdk service package. Minting submits the virtual CKB transaction to the queue after Bitcoin broadcast.

### RGB++ SDK

The recommended RGB++ SDK includes spore examples: prepare cluster, create cluster, create spores, transfer, and leap.

The SDK functions as a wallet and transaction coordination layer for RGB++. It handles:

- Bitcoin transaction construction
- CKB virtual transaction construction
- Commitment generation
- Signature and ownership verification
- Dual-chain coordination
- Submission to the btc-assets-api queue

The SDK abstracts much of the complexity involved in maintaining atomicity between Bitcoin UTXOs and CKB Cells.

### CCC

CCC documentation links the RGB++ SDK and Spore SDK as companion tools for CKB JS/TS development. There is a dedicated rgbpp-sdk branch on the CCC repository for this integration path.

BitProof will use connector-react for CKB wallet connection and the rgbpp-sdk service package for BTC and RGB++ API access -- same ecosystem, different packages.

### Key Features I Learned

Some of the most important RGB++ features I encountered include:

- Single-Use Seals
- Isomorphic Binding
- Blockchain-enhanced validation
- Non-interactive send-then-claim transfers
- Spore NFTs on RGB++
- xUDT for fungible RGB++ coins
- SPV-based Bitcoin verification
- RGB++ SDK and btc-assets-api queue
- RGB++ Explorer for asset lookup

### Personal Understanding

My current understanding is that RGB++ solves RGB's practical gaps by binding Bitcoin UTXOs to CKB Cells and moving validation on-chain where scripts can enforce rules publicly.

The foundational concepts:

- Single-Use Seals
- Blockchain-Enhanced State Validation
- Isomorphic Binding

These are supported by:

- RGBPP_lock
- BTC_TIME_lock
- Config Cells
- CKB Bitcoin SPV
- RGB++ SDK
- btc-assets-api

The transaction order is non-negotiable: compute CKB virtual transaction, commit on Bitcoin, submit CKB through the queue, verify on both chains.

BitProof sits on top of this stack: reward scripts for PROOF on CKB, RGB++ Spore for badges on Bitcoin.

RGB++ separates responsibilities very cleanly.

Bitcoin provides:

- Ownership
- Settlement
- Security

CKB provides:

- Computation
- State management
- Smart contract execution

This architecture allows advanced decentralized applications to be built around Bitcoin without sacrificing Bitcoin's security model.

### Next Steps

My next focus will be:

- Building BitProof -- scaffold the app and connect CKB wallet
- Run rgbpp-sdk cluster setup on Signet
- Mint first Explorer badge Spore
- Configure Signet deployment hashes from the Resource Hub
- Wire reward script env vars for real claim scanning
- Capture tx hashes in RGB++ Explorer and CKB explorer

I am particularly interested in completing the full flow: redeem PROOF on CKB, mint badge on Bitcoin, verify in gallery.
