# CKB Builder Track Dev Log (Week 8)

- Name: Chioma Christopher
- Week Ending: 14-06-2026

## What I Explored

This week I focused on understanding fungible assets on CKB through xUDT (Extensible User Defined Tokens).

Over the last few weeks I spent most of my time studying RGB++, Bitcoin UTXOs, Single-Use Seals, Isomorphic Binding, Spore NFTs, RGBPP_lock and the RGB++ transaction model. That gave me a clear understanding of how unique assets and credentials can be represented across Bitcoin and CKB.

The missing piece was fungible assets.

Since my BitProof project combines achievement badges with reward tokens, I wanted to understand how rewards should be represented on CKB before moving further into implementation.

My goal this week was therefore to understand:

- What xUDT is
- How it differs from sUDT
- How extension scripts work
- How owner mode works
- How fungible assets fit into RGB++
- How xUDT can support the PROOF reward system in BitProof

I did not ship application code this week. Everything here is focused on architecture, protocol understanding and mapping CKB asset primitives to my planned application.

---

## Why xUDT Exists

Simple UDT (sUDT) provides the basic fungible token standard on CKB.

A simple token only needs:

- Ownership
- Balances
- Transfers
- Minting

For many real-world applications, however, tokens require additional rules and behaviors.

Examples include:

- Maximum supply limits
- Transfer restrictions
- Compliance requirements
- Timelocks
- Programmatic minting
- Permissioned operations
- Custom validation logic

Instead of creating a completely new token standard for every use case, CKB extends sUDT into xUDT.

xUDT remains backward compatible with sUDT while introducing programmable behavior through extension scripts.

The biggest realization for me was that xUDT is not a separate token model.

It is essentially:

**sUDT + programmable validation logic**

This makes xUDT similar to how ERC-20 works on Ethereum, except the logic is implemented through CKB's Cell and Script model rather than a monolithic smart contract.

---

## Understanding xUDT Cells

An xUDT Cell contains three primary components:

### Amount

The token balance.
This behaves exactly like sUDT.

### xUDT Args

Configuration data used to define token behavior.
These arguments determine:

- Ownership rules
- Extension scripts
- Validation behavior

### xUDT Data

Optional storage used by extension scripts.

This allows tokens to store custom application-specific information while remaining fungible assets.

---

## Extension Scripts

The most important concept I learned this week is the Extension Script system.

Instead of hardcoding functionality into the token standard itself, xUDT allows developers to attach custom validation logic.

Every extension script behaves like an additional rule that must pass before a transaction succeeds.

Examples include:

### Supply Caps

Prevent total supply from exceeding a predefined limit.

### Transfer Restrictions

Limit how much can be transferred.

### Timelocks

Prevent transfers before a specified block height or timestamp.

### Compliance Rules

Whitelist or blacklist certain transfers.

### Custom Business Logic

Application-specific rules determined by the developer.

The transaction only succeeds when all extension scripts return success.

This effectively turns a fungible token into a programmable asset.

---

## How Extension Scripts Execute

xUDT can load extension scripts in three ways:

### Built-In Scripts

Some predefined extension scripts are embedded directly inside xUDT.

### Existing Transaction Scripts

If the transaction already contains a matching script hash, xUDT can reuse the validation.

### Dynamic Loading

xUDT can dynamically load extension scripts from Cell dependencies using ckb_dlopen2().

Each extension script exposes a validate() function that performs custom verification logic and returns success or failure.
This design makes xUDT extremely modular.

Instead of modifying token logic, developers compose new behaviors by attaching extension scripts.

---

## Owner Mode

I spent considerable time understanding Owner Mode because it controls privileged operations such as minting.

In sUDT, owner mode is activated when a transaction consumes a Cell controlled by the owner's lock script.

xUDT expands this concept.

Owner mode can be enabled through:

### Owner Cell

Traditional sUDT behavior.

### Owner Script + Signature

A validation script can verify ownership through signatures without consuming a dedicated owner Cell.

This was one of the most interesting concepts I encountered.

Instead of creating transaction bottlenecks around a single owner Cell, ownership can be proven cryptographically through signatures.

For applications requiring automated issuance or reward distribution, this is significantly more flexible.

---

## Witness-Based Validation

Another concept I learned was the role of witnesses.

Witnesses provide transaction-specific information that extension scripts may require.

Examples include:

- Signatures
- Extension data
- Ownership proofs
- Validation parameters

This allows xUDT tokens to remain lightweight while still supporting complex validation logic.

The token structure stores permanent state.

Witnesses provide temporary transaction context.

---

## Two Extension Patterns

### Pattern 1: Raw Extension Scripts

Extension script definitions are stored directly inside xUDT arguments.

Advantages:

- Simple
- Self-contained
- Easy to verify

Tradeoff:

- Larger on-chain storage requirements

### Pattern 2: P2SH-Style Extensions

Only the hash of extension scripts is stored in xUDT arguments.

Actual script data is supplied later through witnesses.

Advantages:

- Smaller on-chain footprint
- Greater flexibility

This reminded me of Bitcoin's Pay-To-Script-Hash design where the script itself is revealed only when needed.

---

## Relationship to RGB++

One question I had throughout my RGB++ research was:

What is the fungible equivalent of Spore?

This week clarified that answer.

### Spore

Used for:

- NFTs
- Digital Objects
- Credentials
- Collectibles

### xUDT

Used for:

- Fungible assets
- Tokens
- Reward systems
- Programmable currencies

Together they form complementary asset primitives.

Spore represents uniqueness.

xUDT represents quantity.

---

## How This Relates to BitProof

The architecture for BitProof became much clearer after studying xUDT.

### Achievement Layer

Implemented with RGB++ Spores.

Represents:

- Explorer Badges
- Credentials
- Achievements
- Reputation Objects

Ownership follows Bitcoin UTXOs through RGB++.

### Reward Layer

My initial BitProof architecture used sUDT for the PROOF reward token because the reward system only required basic token functionality such as minting, balances and transfers.

While studying xUDT this week, I began evaluating whether xUDT would provide a stronger long-term foundation for the reward layer.

sUDT is sufficient for a simple reward token, but xUDT introduces programmable token behavior through extension scripts. This means future versions of BitProof could potentially support application-specific rules without requiring an entirely new token model.

Examples I considered include:

- Achievement-gated rewards
- Reputation-based reward multipliers
- Transfer restrictions
- Timelocked rewards
- Staking mechanisms
- Anti-abuse reward logic

I have not yet decided whether the MVP should use sUDT or xUDT, but studying xUDT helped me understand how the PROOF token could evolve beyond a simple fungible asset as the platform grows.

### Combined Flow

A user:

1. Completes an achievement.
2. Claims a reward.
3. Receives PROOF tokens through sUDT (or potentially xUDT in a future iteration).
4. Mints an achievement badge as a Spore.
5. Holds both a credential and a fungible reward.

This separation keeps identity, achievements and incentives independent while allowing them to work together.

---

## Key Concepts Learned

- xUDT
- sUDT
- Extension Scripts
- ScriptVec
- XudtWitness
- XudtData
- Owner Mode
- Signature-Based Ownership
- Dynamic Script Loading
- Witness-Based Validation
- P2SH-Style Extensions
- Programmable Fungible Assets
- RGB++ Asset Architecture

---

## Personal Understanding

My current understanding is that xUDT serves as the programmable fungible asset layer of CKB.

sUDT provides the core accounting model.

xUDT introduces extensibility through modular validation scripts.

Rather than embedding every possible feature into the token standard, xUDT allows developers to attach behaviors only when needed.

This makes the model both flexible and composable.

The most important concepts for me were:

- Extension Scripts
- Owner Mode
- Witness-Based Validation

Together these concepts allow fungible assets to behave more like programmable applications than simple balances.

One practical insight from this week's research was realizing that my original BitProof design already works with sUDT. The value of xUDT is not that it replaces sUDT, but that it enables future programmability. Studying xUDT helped me think beyond basic token balances and consider how reward eligibility, reputation systems, staking mechanics and other application-specific rules could eventually be enforced directly at the asset layer.

Combined with RGB++ and Spore, xUDT completes the picture of how both fungible and non-fungible assets can coexist across Bitcoin and CKB.

---

## Next Steps

My next focus will be:

- Study real-world xUDT implementations
- Learn token issuance workflows on CKB
- Evaluate sUDT versus xUDT for the PROOF token
- Create a prototype PROOF token architecture
- Scaffold the BitProof application
- Connect wallet infrastructure
- Configure RGB++ SDK for Signet
- Create first Spore badge
- Design reward distribution mechanisms
- Verify assets through RGB++ Explorer and CKB Explorer

Before implementing the complete BitProof flow, I want a solid understanding of both sides of the asset model:

- Spore for achievements and credentials
- Fungible tokens for rewards and incentives

With RGB++ and xUDT now mapped into the same mental model, I feel much closer to beginning actual BitProof development.
