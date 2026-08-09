## CKB Builder Track Dev Log (Week 14)

- Name: Chioma Christopher
- Week ending: 09-08-2026
- Project: **Chain Letter** (Keepers Relay)
- Focus: **Wallet-connected identity and real on-chain profile surfaces**
- Status: **Multi-page product with wallet identity, on-chain username/profile/endorsements; Chain Cell handoff still mocked**

> **Side note:** Week 15 updates will follow in the next few days. I'll add
> the deployed Vercel link here once it's live.

onetwothreefourfive

---

## TL;DR

This week I moved Keepers Relay from a single mock-page vibe toward a real
multi-page app with wallet-connected identity and on-chain profile surfaces.

## What I Shipped

- Added/expanded multi-page product views (live chain, builders, relays,
  relay detail, studio, profiles).
- Kept the Chain Letter core loop live in UI (countdown, pass flow, lineage,
  dead-state handling).
- Wired wallet connection with the CCC provider flow.
- Added on-chain username claim/read flow.
- Added on-chain profile create/update flow.
- Added Spore avatar mint/melt flow, synced back to the on-chain profile
  cell.
- Added public `/u/[username]` profile pages and on-chain endorsement flow.
- Preserved React Query cache/mutation patterns across app and APIs.

## Build + Release Readiness

- Production build status: PASS (`pnpm build`)
- Blocking type/build issues fixed this week: 1
- Known release caveat: chain/relay/queue gameplay state is still an
  in-memory server store and not yet indexer/database backed.

## What Works Right Now

- Wallet connect/disconnect and wallet identity display.
- Builder roster and public profile pages.
- Relay hub and relay detail flow with proof/review states.
- Studio for avatar/profile management.
- On-chain username/profile/endorsement integrations (when env vars are
  configured).

## What Is Still Mock or Incomplete

- Real Chain Cell transaction handoff path.
- Chain Cell type script enforcement.
- Indexer-backed chain lineage source of truth.
- Persistent DB for queue/artifact/relay attempts.
- Reward treasury / sUDT claim flow (PROOF is still a soft, off-chain
  counter).
- Notification + moderation + abuse prevention pipeline.

## Notes for Next Week

1. Replace in-memory chain store with a persistent read/write service.
2. Implement the real handoff transaction lifecycle.
3. Add indexer confirmations and explorer links.
4. Add operational safeguards (rate limits, moderation hooks, retries).

## Personal Reflection

The big progress this week is that the app feels like a real product
surface now, not just a single-screen prototype. The next real milestone is
making Chain Cell handoff truly on-chain and durable.

**Keep it alive. Leave a mark. Pass it on.**
