# Week 21

- Name: Chioma Christopher
- Week ending: 10-08-2026
- Project: Keepers Relay

---

## What happened

Last week I tried to make the quiz actually verified on CKB. That part worked. I got an answer onto testnet, the event cell stored the tally, and you could open the transaction on the explorer and see it.

But the product around it did not feel right.

The turn flow was too long. I kept hitting timeouts because I could not wait for a CKB confirmation every time someone answered. The clock on the screen and the clock on the chain were doing different jobs. The host was still effectively the one signing off on whether an answer was correct. I also tried a lyric mode where players write a line, commit it, then reveal it. That is a different game, and it made the whole system heavier instead of clearer.

So I stopped building on that event model. I moved the old contracts and old event screens out of the app.

## Where the app is going

The game is now going in a simpler direction: sudden death.

One match. One clock. One pot. One king.

A host writes the questions. They can be normal multiple-choice questions or finish-the-line questions. Players do not write the lines. They pick one of four options.

This fits CKB much better than the turn-based version did. A cell can only be spent once, so only one person can take the crown in that update. The pot is simply capacity sitting in a treasury cell. When the deadline hits, `since` is what unlocks it for the winner. The script checks a Merkle proof. A server can delay a transaction, but it cannot invent a winner.

## The answer logic

I was not just using a salt by itself. The salt was part of the commitment, but the real security came from the Merkle proof.

Each question leaf is built from the match id, the question index, the prompt hash, the correct answer index, the option count, and a random salt. The match id ties the proof to that room. The question index has to be the current round. That leaf is then combined with the other leaves into a Merkle tree. The root is stored on the match cell. Later, when the answer is checked, the script verifies the proof against that root. So the chain is not storing the full question text or the full answer content; it is only storing the committed root and checking that the answer proof matches it.

That means the game can keep the actual question and answer data off chain while still verifying correctness on CKB.

## What I am doing now

I have three scripts now: the match, the bid, and the treasury. They typecheck for RISC-V, and five transaction tests pass:

- create
- real steal
- bad proof
- settling too early
- settling on time

The app now has a host page and a play page for this, in the same black-and-lime style. Play can build the proof locally. It is not submitting to testnet yet. Match and bid are already deployed with the same `ckb-cli` flow as before, on new Type IDs. Treasury is the one that did not go out. That is the next step.

I am not sure yet if I need more contracts for the game itself. The old participant cell and reward-claim cell were for the turn event. The bid is the entry. The treasury pays the king directly. The question text and salts stay off chain. Only the root goes on the match cell.

There are still a few things I may need to deal with inside these scripts, not as new contracts. If nobody ever steals, the match cannot settle, so those bids cannot be refunded yet. And once a proof is public in the mempool, someone else could try to copy the answer onto their own bid. I am not going back to commit-reveal just to solve that.

In a few days I’ll post the next update and a live link.
