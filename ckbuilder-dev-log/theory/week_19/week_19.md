# Week 19

- Name: Chioma Christopher
- Week ending: 09-24-2026
- Project: Keepers Relay
- Live app: [keepers-relay.vercel.app](https://keepers-relay.vercel.app)
- Continues: [Week 18](../week_18/week_18.md)
- Report type: Retrospective continuation report

---

## Overview

Week 19 focused on preserving the technical evidence behind the Keepers Relay product and protocol direction.

The goal was not to add another game mode. The goal was to make the existing event protocol understandable, testable, and honest about its remaining gaps.

The most important evidence from this stage was the Event Engine transaction test suite. The scripts were tested through real CKB transaction shapes rather than only being compiled as binaries.

The result was:

> 19 transaction-level tests passed.

These tests cover event creation, paid joining, participant entry cells, lifecycle transitions, timeout behavior, and settlement into reward claims.

---

## 1. Event Engine verification

The current protocol is implemented around four deployable scripts:

- `event-type`
- `participant-type`
- `event-treasury-lock`
- `reward-claim-type`

The shared `protocol-common` library contains layouts and validation helpers but is not deployed as a standalone script.

The transaction tests cover the following paths:

| Area | Verified behavior |
|---|---|
| Create | Event Cell and treasury creation, Type ID checks, invalid creation rejection |
| Join | Paid seat, treasury growth, participant creation, duplicate and wrong-fee rejection |
| Lifecycle | Registration, ready, live, finish, and settlement transitions |
| Gameplay state | Answered turn, selected-index validation, timeout rules |
| Treasury | Grow-only behavior during the event and treasury consumption at settlement |
| Claims | Reward Claim creation and settlement value checks |

The tests are valuable because they exercise the relationships between scripts. The Event Cell, Participant Cell, Treasury, and Claim Cell must all agree about the same event identity and transition.

---

## 2. Bugs exposed by verification

The transaction tests exposed two important bugs.

### Treasury output grouping

The treasury lock originally relied on `group_len(GroupOutput)` in a path where the matching treasury output could exist but the group length could be reported as zero.

That caused an update transaction to be interpreted as a settlement transaction.

The fix was to count matching treasury cells by lock hash across the transaction inputs and outputs.

### Settlement pot decrease

During `FINISHED -> SETTLED`, the treasury is consumed and its value moves into reward claims. The event pot therefore becomes zero.

The join-delta validation was still running during settlement and rejected this valid decrease.

The fix was to skip join-delta validation on the settlement transition and apply the dedicated settlement invariants instead.

These bugs reinforced an important lesson:

> A protocol can look correct at the data-layout level and still fail when the complete transaction shape is exercised.

---

## 3. Pudge deployment evidence

After the fixes:

1. The Event Engine was rebuilt.
2. The transaction suite was rerun.
3. All 19 tests passed.
4. `event-type` was redeployed on Pudge on 2026-09-10.
5. `event-treasury-lock` was redeployed on Pudge on 2026-09-10.
6. `participant-type` and `reward-claim-type` remained unchanged from their 2026-09-09 deployments.
7. Local and Vercel environment variables were updated with the deployment values.

The deployment record is maintained in:

```text
keepers_relay/scripts/event-engine/deployment/scripts.json
```

The deployed scripts represent the current testnet protocol foundation. They should not be described as a complete public production lifecycle until the live create, join, play, settle, and claim path has been demonstrated end to end.

---

## 4. Application integration

The application now has a clearer division between wallet moments and fast gameplay.

### Wallet moments

- connecting a wallet
- authenticating a session
- creating an event
- paying for an on-chain seat
- claiming a reward

### Fast application moments

- displaying questions
- answering during a live round
- updating the visible score
- showing presence and lobby state
- rendering the countdown

The host-controlled paid join path is connected to the Event Engine when the required environment is configured.

Other players can still join the application lobby, but independent paid on-chain seats for every player remain an open protocol milestone.

This is an important limitation to state clearly. The application experience is further along than the permissionless protocol path.

---

## 5. What CKB verifies today

The current scripts verify important economic and state properties:

- the Event Cell identity
- event lifecycle transitions
- participant roster changes
- participant entry-cell ownership
- entry-fee contribution
- treasury growth
- turn and deadline state
- settlement conditions
- reward-claim creation

The current scripts do not yet verify whether the answer to every quiz question is correct. That is currently handled by the application layer.

This gap defines the next meaningful milestone. The next feature should add one verifiable quiz result without forcing every user interaction to become a wallet transaction.

---

## 6. Week 19 outcome

Week 19 preserved the technical foundation for the next implementation stage:

- the protocol has a defined Cell architecture
- the four scripts have a clear division of responsibility
- 19 transaction-level tests pass
- two real protocol bugs were found and fixed
- corrected scripts were redeployed on Pudge
- the current limitations are documented rather than hidden

The next step is a small CKB-verified quiz round. The objective is to make CKB verify a result, not merely record a result that a server has already decided.

**Live app:** [https://keepers-relay.vercel.app](https://keepers-relay.vercel.app)
