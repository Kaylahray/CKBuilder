# Week 17

- Name: Chioma Christopher
- Week ending: 09-09-2026
- Project: Keepers Relay
- Live app: [keepers-relay.vercel.app](https://keepers-relay.vercel.app)

---

## Overview

Week 17 was mainly about refining Keepers Relay based on feedback, testing the original idea against the actual user experience, and making the CKB architecture match the product instead of forcing the product around the contracts.

The project started from the idea of a living collectible where a Cell moves from person to person, each holder leaves a mark, and the history grows over time.

The idea was interesting from a CKB Cell Model perspective, but I received an important question:

> **What is the gameplay loop here, and what makes people come back?**

That question became one of the biggest turning points for the project.

It made me realize that having an interesting on-chain object was not enough. I needed a reason for people to repeatedly participate, watch what was happening, compete, and return to future events.

From that feedback, Keepers Relay gradually evolved into a multiplayer event system built around a growing pot, a shrinking/resetting clock, player turns, challenges, scoring, and rewards.

The current direction is:

> **Keepers Relay is a transaction-driven multiplayer event game built around a stateful on-chain Event Cell, participant entry proofs, a treasury, and verifiable reward claims.**

Questions are the first challenge format, not the entire definition of the platform.

---

## 1. Progressive feedback shaped the product

The current direction did not come from one design decision. It came from progressively questioning the original idea.

### What is the gameplay loop, and what makes people come back?

This was the most important feedback I received.

The original living collectible idea had an interesting ownership and passing mechanic, but I had not fully answered why someone would keep coming back after their first interaction.

That pushed me to think more about the event itself.

I wanted an experience where something is constantly changing:

- Players enter
- Players take turns
- Challenges are presented
- The outcome changes the state
- The pot can grow
- The clock becomes more intense
- Another player takes over
- The event continues until a final result is reached
- Winners receive rewards

That became the core loop:

```text
Enter
  ↓
Make Move
  ↓
Challenge
  ↓
Result
  ↓
Pot Grows
  ↓
Clock Resets / Shrinks
  ↓
Next Player
  ↓
Repeat
  ↓
Clock Expires
  ↓
Winner Determined
  ↓
Reward
```

The important change was thinking about the event as something that evolves instead of something that simply starts, asks questions, and ends.

- The **growing pot** gives players an economic reason to care about the event.
- The **shrinking clock** creates pressure.
- The **turn system** makes players pay attention to what happens next.
- The **possibility of winning** creates competition.

Together, these create a much stronger answer to the original question of why someone should come back.

---

## 2. The growing pot and shrinking clock became the main game mechanic

Another important part of the feedback was the idea of combining a growing pot with a shrinking or resetting clock.

Instead of having a completely static event, the state changes as players participate.

- The **pot** represents the economic progression of the event.
- The **clock** represents the pressure.

The two work together:

```text
Early Game
→ More time
→ Smaller pot

Middle Game
→ More participants
→ Growing pot
→ Less time

Late Game
→ Higher pressure
→ Larger reward
→ Faster decisions
```

This made the event feel more like a live multiplayer system instead of a normal quiz.

It also created a natural reason to keep watching an active event because the result is not known from the beginning.

---

## 3. I realized the original “game modes” were actually rule combinations

The frontend initially had separate concepts such as:

- Rapid Q&A
- Survival
- Shrinking Clock
- Pot Rush
- Knowledge Battle
- Chain / Archive

After looking at the product more carefully, I realized that most of these were not separate games.

They were different combinations of rules.

Instead of building six independent game modes, the architecture became **one event engine with configurable rules**:

| Rule            | Options                       |
| --------------- | ----------------------------- |
| Prize           | Growing Pot                   |
| Win             | Highest Score / Last Standing |
| Time            | Fixed / Shrinking + Resetting |
| Scoring         | Accuracy + Speed              |
| Challenge Type  | Questions                     |
| Question Source | AI Generated / Manual         |

This was a major simplification.

It means I can build one multiplayer engine and change how an event behaves without creating a separate contract and backend for every mode.

That also makes the CKB layer more reusable because the protocol is focused on state transitions and economic rules rather than one specific game.

---

## 4. The pass became a state transition instead of a button

Another thing I reconsidered was the idea of a player explicitly pressing a Pass button.

The more I thought about the game loop, the more unnecessary that became.

A successful action naturally advances the game:

```text
Current Player
      ↓
Answer
      ↓
Result Recorded
      ↓
Next Player
```

The same should be true when someone times out.

A player should not be able to hold the game hostage simply because they did not press a button.

A timeout therefore becomes:

```text
Deadline Reached
      ↓
Timeout Recorded
      ↓
Next Player
```

The game should never get stuck waiting for a player to manually pass after their time has expired.

That made the timer and turn state part of the actual game engine rather than just frontend behavior.

---

## 5. The product became product-first and infrastructure-second

Another important lesson from this week was being more deliberate about what actually needs to live on CKB.

I do not want every UI interaction to become a blockchain transaction.

That would make the experience slower, more expensive, and difficult to use.

Instead, I separated the product into state and economic information that benefits from being on-chain and high-frequency application behavior that should remain off-chain.

**On-chain**

- Event identity
- Event lifecycle
- Important event rules and commitments
- Participant entry proof
- Entry-fee contribution
- Treasury / pot value
- Authoritative turn state
- Turn deadlines
- Economically meaningful state transitions
- Event settlement
- Reward claims

**Off-chain**

- Question text
- AI generation
- Question editing
- Realtime UI
- Notifications
- Chat
- Presence
- Profiles
- Avatars
- Analytics
- Visual countdown rendering

The principle became:

> Put state, ownership, economic value, and verifiable commitments on CKB while keeping high-frequency UX and content off-chain.

That gives CKB a meaningful role without making the application unnecessarily blockchain-heavy.

---

## 6. Participant Entry Cells became an important part of the protocol

One of the biggest architectural improvements was introducing a dedicated Participant Entry Cell.

A simple `player_count` is not enough to prove who actually joined an event.

It does not independently prove:

- who the player is
- that they actually joined
- that they paid the required entry
- which event they joined

The Participant Entry Cell gives the protocol an explicit membership primitive.

Conceptually:

```text
Player Wallet
     ↓
Paid Entry
     ↓
Participant Entry Cell
     +
Event Roster
     +
Treasury Contribution
```

The Participant Entry Cell commits to the relationship between:

```text
Event + Player + Entry
```

This gives the protocol a much stronger foundation.

It also opens possibilities for future functionality such as:

- event attendance history
- participation records
- reward eligibility
- leaderboards
- reputation
- achievements
- event history
- external integrations
- SDK usage

For the current MVP, the Event Cell can maintain a bounded participant roster.

The important part is that participation is no longer represented by only a number.

---

## 7. The treasury became the economic source of truth

Another correction was separating the pot shown inside the Event Cell from the actual CKB backing that pot.

The Event Cell can record the current pot state, but the Treasury is where the real economic value lives.

The intended invariant is:

```text
Event.pot_amount = Treasury Spendable Capacity
```

During the active event, the treasury should not silently lose funds.

It can grow through valid economic actions such as:

```text
Entry Fees + Sponsorship
```

At settlement:

```text
Event
   ↓
FINISHED
   ↓
SETTLED

Treasury
   ↓
Reward Claims
   ↓
Winners
```

This makes the pot more than a number shown by the frontend.

It makes the game economy backed by actual CKB state.

---

## 8. The contract architecture became clearer

The current protocol is built around four main contract responsibilities.

### Event Type Script

The Event Cell represents the authoritative event state machine.

The lifecycle is:

```text
REGISTRATION
      ↓
READY
      ↓
LIVE
      ↓
PAUSED
      ↓
FINISHED
      ↓
SETTLED
```

The Event Cell contains information such as:

- event identity
- controller
- rules
- participant information
- current holder
- turn number
- turn state
- start time
- deadline
- pot state
- event status

The Event Cell therefore represents the shared state of the game.

### Participant Type Script

Each player's participation is represented by a Participant Entry Cell.

This connects the player to the event and creates an on-chain proof of entry.

### Event Treasury Lock

The treasury holds the actual CKB associated with the event.

It is responsible for protecting the event's economic value throughout the game and ensuring that settlement is handled through the expected path.

### Reward Claim Type Script

Winners receive explicit reward claim objects.

A claim is tied to:

```text
Event + Recipient + Amount + Nonce
```

This gives the reward an on-chain identity rather than leaving the payout only in an off-chain database.

---

## 9. The current implementation exposed an important limitation

As the contracts were implemented, another important detail became clear.

Players can already interact with events in the application.

They can:

```text
Open Event
   ↓
Click Join
   ↓
Enter Lobby
   ↓
Wait for Match
```

So the product experience is not blocked.

However, the current Event Cell is controlled by the host/controller.

That means the full on-chain join path currently works like this:

```text
Host Join
   ↓
Event Cell Update
   ↓
Treasury Contribution
   ↓
Participant Cell Creation
```

For other players, the current application can register the lobby join, but the official paid on-chain seat is still pending under the current controller-led design.

This is a **protocol limitation** rather than a frontend limitation.

That distinction is important because I do not want to claim that the current implementation has solved permissionless player entry when it has not.

---

## 10. The next protocol problem is player entry

The main question moving forward is now:

> How can a player's paid seat settle on CKB without turning the game into repeated wallet popups?

There are several possible directions.

### Controller / relayer model

The player requests to join and the controller or relayer completes the official on-chain seat.

### Combined payment and controller authorization

The player provides the entry payment while the host/controller authorizes the shared Event Cell update within the same transaction flow.

### Different Event authorization model

The Event Cell could eventually be structured so that a player can join without requiring the host to manually unlock the Event Cell for every player.

This needs to be tested against the actual transaction model and desired user experience before being treated as final.

---

## 11. Why the relayer/controller model makes sense for the MVP

A core product requirement is that the game should feel fast.

For example:

```text
Player Answers
      ↓
Result
      ↓
Next Turn
```

is a much better experience than:

```text
Player Answers
      ↓
Wallet Popup
      ↓
Sign
      ↓
Wait
      ↓
Confirm
      ↓
Next Turn
```

If every answer required a wallet transaction, the multiplayer experience would become slow and frustrating.

The goal is therefore to keep the user experience fast while still putting important state transitions and economic actions on CKB.

That is why the controller/relayer model is useful for the MVP.

---

## 12. The shrinking clock became protocol state

The timer should not only exist visually in the frontend.

The Event Cell stores information representing the current turn:

- Turn Number
- Turn State
- Current Holder
- Turn Start
- Turn Deadline

The intended duration can be derived from the event configuration:

```text
turn_duration = max(
    min_turn_secs,
    base_turn_secs - (turn_number * shrink_step_secs)
)
```

The frontend simply displays the countdown.

It should not be the authority deciding whether a player has timed out.

The server/relayer can detect when the deadline has passed and initiate the transition, while the CKB state becomes the authoritative record of the transition.

Conceptually:

```text
PENDING
   ↓
Deadline Reached
   ↓
TIMED_OUT
   ↓
Next Holder
   ↓
PENDING
```

This also makes it possible for the event to continue even when a player stops responding.

---

## 13. The larger infrastructure opportunity

Although the first product is a multiplayer game, the underlying pattern is broader.

The protocol repeatedly follows:

```text
Current State
      ↓
Authorized Action
      ↓
Validation
      ↓
New State
      ↓
Next Holder / Next State
```

That is a reusable stateful interaction pattern.

The product therefore acts as a real implementation that can prove whether these primitives are actually useful before trying to package them into an SDK.

The longer-term direction could become:

```text
CKB Stateful Event Primitive
        ↓
Reusable Transaction Patterns
        ↓
SDK / Libraries
        ↓
Other CKB Applications
```

I want the product to prove these abstractions first rather than designing an SDK without enough real usage to justify it.

---

## 14. Week 17 implementation status

### Product

| Item                                      | Status  |
| ----------------------------------------- | ------- |
| One core multiplayer event model          | Done    |
| Growing pot mechanic                      | Done    |
| Shrinking/resetting clock concept         | Done    |
| Configurable prize/win/time/scoring rules | Done    |
| Questions as the MVP challenge type       | Done    |
| AI Generated question flow                | Done    |
| Manual question flow                      | Done    |
| Event lobby                               | Done    |
| Player join UI                            | Done    |
| Host-controlled on-chain join path        | Done    |
| Fully independent on-chain player entry   | Not yet |
| Complete end-to-end testnet event         | Not yet |

### Backend

| Item                                | Status  |
| ----------------------------------- | ------- |
| Event domain model                  | Done    |
| Participant model                   | Done    |
| Turn/game engine                    | Done    |
| Server-authoritative timer design   | Done    |
| Question service                    | Done    |
| AI adapter                          | Done    |
| Scoring                             | Done    |
| Realtime event flow                 | Partial |
| Settlement/reward model             | Partial |
| Complete transaction reconciliation | Not yet |
| Production-ready relayer flow       | Not yet |

### CKB Protocol

| Item                                         | Status  |
| -------------------------------------------- | ------- |
| Event Type Script                            | Done    |
| Participant Entry Type Script                | Done    |
| Event Treasury design                        | Done    |
| Reward Claim Type Script                     | Done    |
| Event lifecycle                              | Done    |
| Participant roster model                     | Done    |
| Treasury as economic source of truth         | Done    |
| Turn/deadline state model                    | Done    |
| Shrinking-clock configuration                | Done    |
| Settlement model                             | Done    |
| Compile against final target toolchain       | Done    |
| Run transaction-level test matrix            | Not yet |
| Devnet deployment                            | Partial |
| Testnet deployment (Pudge)                   | Done    |
| Verify the complete event lifecycle on-chain | Not yet |

---

## 15. What I am taking into the next stage

Week 17 left the project in a much stronger position than where it started.

The most important change was not simply writing more code.

It was figuring out what the product actually needed to be.

The original idea gave me a useful CKB-native foundation, but the question:

> **What makes people come back?**

forced me to think about the actual gameplay experience.

That led to:

- the growing pot
- the shrinking/resetting clock
- the evolving event state
- player turns
- automatic timeout transitions
- competition
- rewards
- the need for explicit participant entry proofs

At the same time, those product decisions exposed deeper protocol questions:

- Who controls the Event Cell?
- How is player participation proven?
- Where does the actual pot live?
- What should happen when a player times out?
- How can state remain authoritative without requiring a wallet popup for every move?
- Which application actions actually deserve to become CKB transactions?

These are now the problems I am solving.

The immediate implementation goal is to close the gap between:

```text
Product Join
      ↓
Pending Seat
```

and:

```text
Product Join
      ↓
Participant Entry Cell
      ↓
Treasury Contribution
      ↓
Authoritative Event Membership
```

Once that is resolved, the next step is to run the complete lifecycle through the live app on testnet.

---

## Closing Note

Keepers Relay has moved from a simple living collectible concept into a more complete multiplayer protocol.

What started as:

> A Cell is passed between people

has evolved into:

```text
An event has state
        ↓
Players enter
        ↓
The pot grows
        ↓
Players take turns
        ↓
The clock creates pressure
        ↓
State changes
        ↓
The event resolves
        ↓
Winners receive rewards
```

The CKB Cell Model is no longer just the technology underneath the project.

It is part of how the product works.

The most valuable lesson from Week 17 was that progressive feedback changed both the product and the protocol.

- The question about the **gameplay loop** led to a stronger product.
- The question about **why people return** led to a stronger game mechanic.
- The question about **what belongs on-chain** led to a stronger protocol boundary.

And the implementation itself exposed the next real protocol challenge: making player participation fully settle on CKB while preserving a fast multiplayer experience.

The direction going forward is:

> Build the product users can understand and return to, then extract the CKB primitives that prove themselves useful through the product.

**Live app:** [https://keepers-relay.vercel.app](https://keepers-relay.vercel.app)
