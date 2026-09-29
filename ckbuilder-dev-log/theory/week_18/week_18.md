# Week 18

- Name: Chioma Christopher
- Week ending: 09-17-2026
- Project: Keepers Relay
- Live app: [keepers-relay.vercel.app](https://keepers-relay.vercel.app)
- Continues: [Week 17 Part 2](../week_17/week_17_part2.md)
- Report type: Retrospective continuation report

---

## Overview

Week 18 focused on turning the work completed in Week 17 into a clear product and protocol direction.

Week 17 answered the most important product question: an interesting CKB Cell is not enough. People need a reason to return, compete, and care about the next state transition.

The answer became a multiplayer event game with:

- a growing prize pot
- a shrinking and resetting clock
- player turns
- questions as the first challenge format
- participant entry proofs
- an on-chain treasury
- settlement and reward claims

The work in this report is therefore a continuation of the Week 17 product and protocol decisions. It does not introduce a separate product direction.

The central product and protocol direction became:

> Keepers Relay is a quiz-led product that proves a reusable CKB stateful-event primitive.

The quiz is the user-facing experience. The reusable infrastructure is the event state machine, participant proof, treasury, settlement, and future verification layer.

---

## 1. The product direction became clearer

The original idea was a living collectible passed between people. That idea helped me understand the Cell Model, but it did not yet provide a strong reason for repeated participation.

The product is now organized around a repeatable event loop:

```text
Join
  -> Take a turn
  -> Answer a challenge
  -> Record the result
  -> Update the event
  -> Grow or preserve the pot
  -> Reset or shrink the clock
  -> Continue until settlement
```

Questions remain the first challenge type because they are understandable, easy to demonstrate, and suitable for both casual and competitive play.

The larger abstraction is an event whose state changes through validated actions.

```text
Current State
  -> Authorized Action
  -> Validation
  -> New State
  -> Next Holder or Next Phase
  -> Settlement
```

This gives Keepers Relay a product that people can understand and a protocol pattern that other CKB applications can reuse.

---

## 2. Why the project is CKB-native

The project is not using CKB only as a payment rail.

The Event Cell represents the shared state of the event. It commits to information that must remain consistent across transitions:

- event identity
- creator and controller
- event rules
- participant roster
- current holder
- turn number and turn state
- turn deadlines
- treasury reference
- question-set commitment
- result commitment
- event lifecycle

The Participant Entry Cell represents a player's paid membership in the event.

The Treasury Lock protects the actual prize value rather than trusting a number displayed by the frontend.

The Reward Claim Type Script gives the payout an explicit on-chain identity and allows a winner to claim it through the intended path.

The resulting protocol surface is:

```text
Event Cell
  + Participant Entry Cells
  + Event Treasury
  + Reward Claim Cells
```

This is a stronger protocol direction than presenting a frontend with an unrelated token or collectible. The Cell Model is part of the product's rules.

---

## 3. The application and protocol boundary

One of the main architectural decisions was deciding what belongs on-chain.

### On-chain

- event identity
- immutable event rules and commitments
- participant entry proof
- entry-fee contribution
- treasury value
- authoritative event lifecycle
- turn and deadline state
- settlement
- reward claims

### Off-chain

- realtime UI updates
- question presentation
- AI question generation
- question editing
- chat and presence
- notifications
- profiles and avatars
- analytics
- visual countdown rendering

The principle is:

> Put ownership, economic value, state transitions, and verifiable commitments on CKB. Keep high-frequency user experience and content off-chain unless the protocol must verify them.

This boundary keeps the multiplayer experience fast while preserving a meaningful role for CKB.

---

## 4. Reusable infrastructure direction

The project becomes stronger when it demonstrates a real reusable primitive rather than claiming to be six separate games.

The reusable primitive is a stateful CKB event engine with:

- a shared state cell
- configurable rules
- explicit participant membership
- protected treasury value
- validated transitions
- timeout handling
- permissioned or relayed gameplay actions
- permissionless settlement where the protocol allows it
- explicit reward claims

Questions are the first application of the primitive. Other challenge types can be added later without redesigning the entire event and treasury architecture.

This gives the project a practical order of operations:

```text
Build a product people understand
  -> Prove the stateful event pattern
  -> Add verifiable challenge results
  -> Extract reusable transaction patterns
  -> Publish developer documentation
```

The product comes before an SDK. The implementation must prove which abstractions are genuinely useful.

---

## 5. What was deliberately not claimed

The project description must remain honest about the current state.

The current implementation does not yet provide:

- fully independent paid on-chain joins for every player
- a production relayer
- a complete public event lifecycle on testnet
- CKB verification of the correctness of every quiz answer
- a finished settlement and reward-claim UI
- a complete transaction-level matrix beyond the current 19 tests

These are not reasons to hide the project. They are the next milestones for the product and protocol.

The important distinction is:

```text
Current product state is already implemented
Next verification milestone is clearly defined
```

---

## 6. Week 18 outcome

Week 18 established the product and protocol direction that will guide the next implementation stage:

> Keepers Relay is a quiz-led multiplayer event product that uses CKB Cells to represent event state, paid participation, treasury value, and settlement, with CKB-native verification of challenge results as the next milestone.

The next milestone is intentionally small: build one verified quiz round instead of attempting to move the entire realtime game on-chain.

**Live app:** [https://keepers-relay.vercel.app](https://keepers-relay.vercel.app)
