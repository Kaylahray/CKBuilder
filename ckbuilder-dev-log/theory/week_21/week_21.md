# Week 21

- Name: Chioma Christopher
- Week ending: 10-08-2026
- Project: Keepers Relay
- Live app: [keepers-relay.vercel.app](https://keepers-relay.vercel.app)
- Continues: [Week 20](../week_20/week_20.md)

---

## What happened

Last week I was trying to make the quiz actually verified on CKB. That part worked. I got an answer onto testnet, the Event Cell stored the tally, and you could open the tx on the explorer and see it.

The product around it did not feel right.

A turn had to be very long, because I cannot wait for a CKB confirmation every time someone taps an answer. The clock on the screen and the clock on the chain were doing different jobs. JoyID kept failing on stale cells. One wrong code hash and join died with ScriptNotFound. The host was still the one signing that an answer was correct. I also tried a lyric mode where players write a line, commit it, then reveal it. That is a different game, and it made the engine heavier instead of clearer.

So I stopped building on that event. I moved the old contracts and the old event screens out of the app. I am not keeping them as a hidden mode.

## Where the app is going

The game is sudden death. One match. One clock. One pot. One king.

A host writes the questions. They can be normal quiz questions or finish-the-line questions. Players do not write the lines. They pick one of four options.

This fits CKB better than the turn game did. A cell can only be spent once, so only one person can take the crown in that update. The pot is just capacity sitting in a treasury cell. When the deadline hits, `since` is what unlocks it for the king. The script checks a Merkle proof. A server can delay a transaction. It cannot invent a winner.

## What I am doing now

I have three scripts: the match, the bid, and the treasury. They typecheck for RISC-V, and five transaction tests pass. Create, a real steal, a bad proof, settling too early, and settling on time.

The app now has a host page and a play page for this, in the same black and lime look. Play can build the proof locally. It is not submitting to testnet yet, because these scripts are not deployed. That is the next thing. Same `ckb-cli` path I used before, new Type IDs.

I do not think I need a fourth contract for the game itself. The old participant cell and reward-claim cell were for the turn event. The bid is the entry. The treasury pays the king directly. Question text and salts stay off chain. Only the root goes on the match cell.

Two things I still have to deal with, inside these scripts, not as new ones. If nobody ever steals, the match cannot settle, so those bids cannot be refunded yet. And once a proof is public in the mempool, someone else can try to copy the answer onto their own bid. I am not going back to commit-reveal to solve that.
