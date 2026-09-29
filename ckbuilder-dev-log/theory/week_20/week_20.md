# Week 20

- Name: Chioma Christopher
- Week ending: 09-29-2026
- Project: Keepers Relay
- Live app: [keepers-relay.vercel.app](https://keepers-relay.vercel.app)
- Continues: [Week 19](../week_19/week_19.md)
- Report type: Current-week milestone report

---

## Overview

Week 20 begins the next product and protocol milestone: adding CKB-native verification to the quiz while keeping the user experience simple.

The existing Keepers Relay application already has the event, participant, treasury, and reward architecture. The remaining weakness is that quiz correctness is still decided by the application layer.

That is useful for a fast prototype, but it does not yet demonstrate the strongest CKB-native claim.

The next feature is therefore:

> **A CKB-verified quiz round.**

The feature will start small. It will use a fixed question set, a small number of questions, and a testnet transaction path that proves the result can be checked by a CKB script.

---

## 1. Why this feature matters

A new game mode would increase surface area without improving the central protocol claim.

A verified quiz round improves the core claim directly:

```text
Question Set Commitment
  -> Player Answer Evidence
  -> CKB Validation
  -> Verified Score
  -> Event State Update
  -> Settlement
```

The user still experiences a quiz. The protocol gains an explicit verification step.

This makes the project easier to explain to users and protocol reviewers:

- the frontend presents the challenge
- the player submits an answer
- the transaction carries the answer evidence
- the CKB script validates the evidence
- the Event Cell records the resulting score
- the existing treasury and claim flow handles the economic result

---

## 2. First implementation shape

The first version should not attempt to put every realtime interaction on-chain.

It should use a small fixed question set and a committed answer structure.

### Question-set commitment

The question set is represented by a commitment stored in or referenced by the Event Cell. The commitment can be a Merkle root or another deterministic content hash.

The commitment binds the event to a specific set of questions and answer data.

### Answer evidence

A verified answer submission carries:

- event identity
- question index
- selected answer index
- the proof that the question belongs to the committed set
- the expected answer data needed by the verifier
- the player's action commitment where required

### CKB validation

The type script checks:

- the event identity matches
- the question belongs to the committed question set
- the selected answer is valid
- the score transition is allowed
- the player is an eligible participant
- the event is in the correct lifecycle state

### Score update

The Event Cell records the verified score or a committed result hash. The first test should prefer a small, explicit score layout that is easy to inspect in a transaction test.

---

## 3. Privacy and transaction tradeoff

A public on-chain quiz verifier has a natural tradeoff: if the answer key is available to the script, it may also become visible to observers.

The first milestone is intended to prove verification, not solve every privacy problem.

Possible stages are:

1. Public fixed question set for a transparent testnet demonstration.
2. Commit-reveal for answer keys or question-set opening.
3. Batched answer verification so several answers fit into one transaction.
4. A relayer/controller path so players do not sign every answer.
5. More advanced content commitments if private questions become important.

The protocol should document this tradeoff instead of pretending that a public verifier automatically provides private quizzes.

---

## 4. MVP acceptance criteria

The first verified quiz round is complete when:

- a question set is committed to a specific event
- at least one testnet event uses that question-set commitment
- a valid answer proof is accepted by the CKB script
- an invalid answer proof is rejected
- an answer for the wrong event is rejected
- a duplicate or replayed answer is rejected
- the verified score is reflected in the Event Cell or result commitment
- the transaction is reproducible with `ckb_testtool`
- the UI clearly distinguishes a CKB-verified result from an application-only result

The first demo does not need a large question bank, an AI generator, private questions, or a complete wallet transaction for every answer.

---

## 5. Protocol significance

This milestone changes the product and protocol story from:

> Keepers Relay stores a multiplayer quiz event on CKB.

to:

> Keepers Relay uses a quiz to demonstrate a reusable CKB pattern for committed challenge data, verified actions, state transitions, and settlement.

The quiz remains the product users understand. The verification layer is the reusable protocol contribution.

The same pattern could later support other deterministic challenge types, but those should come after the quiz verifier has been tested and demonstrated.

---

## 6. Current status

The CKB-verified quiz round is the Week 20 implementation target. It is not being reported as complete yet.

Already available:

- Event Cell state machine
- Participant Entry Cell
- Treasury lock
- Reward Claim Type Script
- Pudge deployments
- 19 transaction-level tests
- application quiz and event flow

Still to implement:

- question-set commitment layout
- answer-proof format
- verified score transition
- invalid-proof test cases
- testnet demo transaction
- UI status for verified results

This distinction keeps the report credible. Week 20 is the bridge between a transaction-aware quiz product and a genuinely verifiable quiz protocol.

---

## Closing

Keepers Relay does not need to become a completely different contest platform to become technically meaningful.

It needs one clear demonstration that CKB is checking something meaningful about the challenge itself.

The immediate direction is therefore:

```text
Keep the quiz
  -> Commit the question set
  -> Verify one answer round on CKB
  -> Record the verified score
  -> Reuse the existing event treasury and settlement system
```

**Live app:** [https://keepers-relay.vercel.app](https://keepers-relay.vercel.app)
