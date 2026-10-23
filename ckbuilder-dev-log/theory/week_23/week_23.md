# Week 23

- Name: Chioma Christopher
- Week ending: 10-24-2026
- Project: Crowns
- Continues: [Week 22](../week_22/week_22.md)

---

## What happened

Last week Crowns was a quiz. A Merkle root sat in the match cell and the script checked an answer proof. It worked, but it had a hole I could not close inside the quiz itself.

The default bank used fixed salts. Anyone with the repo could compute every proof. And even with private salts, a quiz answer is one tap. Once a right answer is public, anyone can copy it. The chain was checking a secret, and secrets leak.

So this week I kept everything that made the game fun and replaced the part that was weak. The clock still shrinks. The pot still grows. There is still one king. But you no longer answer a question. You play a short arcade game, and the chain replays your run.

## The referee

The game is a lane runner. Three lanes, blocks coming at you, coins to grab. It runs for at most two minutes.

When you play, the browser records every lane change as three bytes: the tick it happened on, and the lane. That list is the tape. When you take the crown, you send the tape, not a score.

The match script does not trust the score. It replays the tape.

CKB-VM runs RISC-V, which means it runs ordinary Rust. So the game rules are one normal Rust crate, `game-core`. I compile it twice. Once to RISC-V for the chain, inside a small script called `lane-runner`. Once to wasm for the browser. Player and referee run the same code, so the score on your screen is the score the chain computes.

The match script calls the game with `spawn`. That is a CKB2023 syscall that lets one script start another script and talk to it through a pipe. The match script spawns `lane-runner` by its data hash, passes it the seed and the tape, and reads back a score as a u64. If the score beats the king's score, and you are not already king, the crown moves. A full replay costs about 1.44M cycles.

Each player gets their own course. The seed is a hash of the match id and the player's lock hash. So a tape copied from someone else's run plays a different road and scores something else. That closes the copy problem the quiz had.

The match script does not know which game it is running. It only knows the game's data hash, which the host picks when the match opens. Any Rust game that takes a seed and a tape and returns a score can sit on the same match, bid and treasury scripts. I wrote that down as Game ABI v1.

## The scripts now

- `match-type` is the crown. It holds the game hash, the fee, the pot, the king, the king's score, and the deadline. Open, steal with replay, close.
- `bid-type` is the entry. It names its owner and can be refunded an hour after the deadline. On creation it points at itself through the proxy lock, so a steal can spend it without asking the owner to sign again.
- `treasury-lock` is the pot. It only lets the pot grow by exactly the fee on a steal, or pay out on the close.
- `lane-runner` is the game.
- The Input Type Proxy Lock is the same copied cell from last week.

`cargo test -p tests --release` passes 52 tests. The new ones are about the run: a replay that matches live play, a malformed tape, the same tape on another course scoring differently, a copied run, a run that claims more than it scored, a tie, the king stealing from himself, and a steal without the game script as a dependency.

## Testnet

Before testnet I ran a whole match on a local devnet with OffCKB, using the app's own transaction code. That found two bugs. The fee I paid on small transactions broke the node's maximum fee rate, and the close did not know the king's full lock. Both fixed before deploy.

Then I deployed v2 to Pudge with `ckb-cli deploy`: `gen-txs`, `sign-txs`, `apply-txs`. All four scripts went out in one transaction:

- Transaction: `0xc9f1f7a3da0aaed8b6f0a0c98614b7c75756db89c938cb7c1f1e5447070301d4`
- match-type type id: `0xbb388fcce8ceef841e98a614f49281032fd66ae57f20aecbc6167ad766b0813f`
- bid-type type id: `0xa76ff5305f3b76692a3fe513a2ee5407164f21344d2d0c8eb93288be3051c78b`
- treasury-lock type id: `0x9e94bb5a49f906bc36bf8059cd8719f16e4f90aad6b76e6aa9ed55cb78c1be75`
- lane-runner data hash: `0xffac03926858495fb6481b1ef64d9a801db214eacb1847ab8e30cc63a35830f2`

One thing I learned: ckb-cli cannot sign for a JoyID lock, because JoyID is a passkey. So the deploy owner is a ckb-cli account, not my JoyID wallet.

## Playing it for real

I played full matches on two browsers and then two phones. That is where the real bugs were.

- The host's own steal was trusted instead of read from its transaction. Now only the opening is taken from the host; every steal is read from the chain.
- A good run was lost if you left the page. Now your best run is kept until you use it.
- After someone took the crown back, my next steal tried to reuse the entry my first steal had already spent. It now notices the entry is gone, locks a fresh one, and sends the same run.
- On a phone the game sat in the middle of the page. It now goes full screen when you press Run.

I also stopped steals in the app the moment the clock hits zero. The chain can only say "not before" with `since`, so it would still accept a better run until someone closes. The app should not offer it.

## Other fixes

Sign-in had a hole. The server checked that a signature was real, but not that the key behind it owned the address you claimed. Now it works out which addresses the signing key controls and rejects the sign-in if yours is not one of them.

Profiles now show real numbers: wins, CKB won, crowns taken and best score. Steals are rebuilt from committed transactions on chain, not from what a browser says.

I removed everything the quiz needed: the bank code, the proof routes, 34 unused images, and 49 old environment values on Vercel, including an old private key.

## What is next

A second game on the same scripts, to prove the match really does not care which game it runs.
