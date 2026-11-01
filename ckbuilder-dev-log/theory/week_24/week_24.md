# Week 24

- Name: Chioma Christopher
- Week ending: 10-31-2026
- Project: Crowns
- Continues: [Week 23](../week_23/week_23.md)

---

## What happened

Last week Crowns became an arcade game the chain replays. This week two people reviewed it closely, and I've been working through what they said: Rick on late actions, and my mentor on bots. Both are written down below, with what they said and what I've built in response so far. This is a progress report. It's all on testnet, and I'm still testing it.

I also worked on something the app had promised from the start. The players list always had a **Challenge** button, but it only opened a crown with the other player's name on it. A crown is everyone against the best score, so that was never really one player against another. So I've been building a real 1v1 mode: Duels.

Where it stands now:

- Crowns runs on Pudge testnet with shorter laps and a clock that can no longer be cut to nothing.
- Challenge is now a real mode, Duels: two players, the same stake each, winner takes both.
- There is a second game, artillery, replayed on chain like the lane runner.
- Each game now declares its own lap count, seal window and clock floor, and the chain holds it to them.

`cargo test -p tests` passes 156 tests. A full Crowns match and a full set of duels pass end to end on a local devnet. Testing with real play on testnet is what is under way now.

## Feedback 1: Rick (CrowdCell)

**What he said.** I asked on the forum what happens if someone steals the crown after the clock runs out. Rick had hit the same thing in CrowdCell. CKB's `since` can only say "not before". It cannot say "not after". So the chain cannot stop a late action. He called it a liveness problem, not a safety problem: the fix is to close fast, not to forbid. He suggested two things. Pay whoever closes a small cut, so someone always has a reason to close at zero. And have the king's own app send the close, because the king is the one who loses if nobody closes.

I read his repo. His keeper is a bot inside his indexer server, with its own wallet, checking every 10 seconds.

**What I've built so far.**

- The close needs no signature now. The script only lets the money go where the result says, so anyone may send it.
- Whoever closes gets 1 CKB, taken from the host's share. It never comes from the pot.
- The king's screen, and any open screen, sends the close by itself when time is up. No wallet pops up.

So no single server or bot wallet keeps crowns closed. A server keeper can still be added later as a backup.

## Feedback 2: my mentor, XuJiandong (CKBuilder issue #45)

**What he said.** Bots are the critical problem. A game the chain can replay is a game a program can search. Every player's road was fixed by the match id and their lock, so a program could play my road thousands of times before paying, keep the best run, and send only that. My own devnet test did exactly this. It tried 400 runs and found a better score than I could. He also said hiding the code does not help, because the script is public. He suggested a zkVM for heavier games, and closing the live cell so late runs stop.

**What I've built so far (v4, then v5).** I cannot make bots impossible. Any run the chain can check, a program can also search for. What I can do is take away the bot's head start. The rule I used: reveal the game piece by piece from blocks nobody can predict, and give a short time to respond.

- **Hidden road.** Your road mixes in the hash of the block your entry lands in. You only learn it after you have paid.
- **Laps.** A run is 5 laps. Lap 1's road comes from the block your entry lands in. Each later lap's road comes from the block where you sealed the lap before. A bot only ever sees one lap ahead.
- **A window per lap (v5).** Each lap must be sealed within a short window of the block that revealed its road, so a bot does not have hours to grind one road. In v4 the window was 10 minutes for the whole run. That made the time you lost waiting for blocks a matter of luck, so v5 gives every lap its own clock. The window is now 2 minutes, set out in the next section.
- **Postmarks.** The chain cannot read "now". So every seal and every steal names the block it depends on in `header_deps`, and the script checks the block's time against the deadline. This is the same trick the Nervos DAO uses.
- **Proof of work on entry**, so mass entries cost something.
- **No popups while playing.** A lap is sealed with a throwaway key in the browser. It is a key cell under CKB's own secp256k1 lock, so I did not have to write a new lock. The key cell goes back to the player when the game ends.

## The lap rules

With the laps working, I've set new numbers and I'm trying them out. The aim is simple: no game should end in an instant, and no time should be spent just waiting.

| Rule | Before | Trying now |
|---|---|---|
| One lap | 24 seconds | 30 seconds |
| Tries per lap | Unlimited | 2: one try and one retry |
| Time to seal a lap | 3 minutes | 2 minutes, with a warning at 30 seconds left |
| Refund after the deadline | 1 hour | 30 minutes |
| Clock after a steal | Could be cut to nothing | Never under 5 minutes after that run's last seal |

The clock floor is the big one. A steal still shrinks the clock, but a player mid-run can always finish. A clock already shorter than the floor is left alone, and it never moves later.

The try limit lives in the app, because the chain cannot see tries. It only sees what gets sealed. The 2-minute window is what the chain enforces.

A longer lap means a new build of the game, so old games need the old one to replay. The app keeps both builds, and `/verify` picks the right one for each game.

## Per-game settings

The goal is an engine that other people's games can run on. But the lap count and the times were written into the scripts that hold the money, so every game had to use the same ones. A short puzzle game could not exist without changing those scripts.

Now the game declares them. Spawned with an empty argument, a game script writes 9 bytes instead of a score: `laps u8 ‖ lap window ms u32 ‖ clock floor ms u32`. This extends Game ABI v2.

- **At open**, `match-type` and `duel-type` spawn the game, ask for its rules and refuse the cell if they do not match. A host cannot open a lane runner match with a 1-hour window.
- **During a game**, the match cell keeps the rules and every steal must leave them unchanged. Entries and race cells keep the laps and the window too, because a seal cannot read the match cell, which moves on every steal.
- **The lane runner** declares 5 laps, 2 minutes and 5 minutes, so it plays the same as before.

This is only the chain's half. A new game still needs a screen in the app, and today the app has one race screen, written for the lane runner.

## Duels: making Challenge real

Before this week, Challenge opened an ordinary crown with your friend invited. Now it opens a duel: two players, the same stake each, and the chain as referee. The stakes are held on chain the whole time, so neither player and no server can walk off with them. It is one script, `duel-type`, with two kinds of cell:

- The **duel cell** holds both stakes. Its lock is the Input Type Proxy Lock pointing back at the duel script, so every spend is decided by the script.
- A **racer cell** carries one player's lane race, a lap at a time. It is that player's key cell.

The paths:

- **Open.** The challenger locks their stake.
- **Cancel.** Before anyone accepts, only the challenger can take it back.
- **Accept.** The opponent adds the same stake. The block this lands in seeds the battlefield.
- **Shot.** The player to move adds one shot, signed by their key cell.
- **Skip.** If a player lets their turn run out, anyone may pass their turn. This needs no signature and pays nobody.
- **Submit (race).** A player hands in their run. It is replayed and its score recorded.
- **Finish.** Anyone may send it. The duel is replayed and the winner is paid both stakes. A draw returns each stake.

There are two games:

- **Lane race.** Both players drive 5 laps of the same lane runner, with the same laps and windows as Crowns. Higher score wins. It reuses the `lane-runner` game script, so there is no second copy of the game.
- **Artillery.** Two tanks take turns firing over a stone tower. Each shot is angle, power and wind. Craters dig into the ground and chip the tower. I wrote the rules twice, in Rust for the chain and in TypeScript for the browser, with integer maths and a fixed sine table so both give identical results. A conformance test plays 40 duels (1,188 shots, 13 of them skipped turns) through both and compares every shot.

**Turns.** Each shot flies in the wind of the block the duel last landed in, so nobody chooses it. A turn has a timer. A duel can be Classic, where every turn has the same time, or Pressure, where each turn is 5 seconds shorter, never under 30 seconds. A turn left to run out is skipped, not lost: the duel only ends when a tank is destroyed, or after 30 turns, when the healthier tank wins. Several overdue turns can be skipped in one transaction, so a duel nobody plays any more can always be finished, and nobody's stake is ever stuck.

**Deadlines without the slow clock.** CKB's `since` uses the chain's median clock, which runs a couple of minutes behind real time. So a skip, and the end of a race, prove the time is up the same way Crowns proves its deadlines: the transaction names the duel's own block and a newer block in `header_deps`, and the script checks that the newer block is stamped late enough. A block can't be stamped in the future, so the turn passes within a block of the clock running out.

**What you see is what the chain judges.** When you fire, the shell flies and lands on your screen at once, using the same rules the chain will replay. The other player's screen plays the same shot as soon as it lands on chain.

## The scripts now

| Script | Job |
|---|---|
| `match-type`, `bid-type`, `treasury-lock` | Crowns: the crown, the entries, the pot |
| `duel-type` | Every duel: escrow, turns, both games, racer cells |
| `lane-runner` | The lane game, shared by Crowns and lane-race duels |
| `artillery` | The tank game |
| Input Type Proxy Lock, secp256k1 | Existing CKB scripts, reused |

Shared pieces live in one `common` crate: laps, postmarks and `spawn_game`. I did not merge duels into the match script. A crown and a duel are different state machines, and one bigger script is harder to review.

## Testnet

- **Retiring the old code.** The deploy account had most of its CKB locked in old v2 and v4 code cells. I checked that no live cell used them any more, then spent 7 of them back to the account: 389,193 CKB, in transaction `0x5ef446c095ee76c93fbabf81aa4febb57cb3c4aefb3313345620d4ee64c2ab75`. v4's lane-runner cell stayed, because v5 uses the same bytes.
- **v5 and Duels.** Deployed in transaction `0x17af6fa0860bebd4d3f1ad2b12c120ac59c17bc66c86b3f8f94ac62ec8ffefa9`. The cells:
  - match-type type id `0x3e1240fd9efbb38e72466449301ef2a96f5554ca4cd9a0a0ff16623290a01d34`
  - bid-type type id `0x5c41a20b5b4361448b8fd3fde00dfbd4464d0f1d7abb66e7b8729cbce61671ac`
  - treasury-lock type id `0x7dab4b0d44d7ab6b2df6befa902ac4268f5c8c4e29a8bc90eb52a90711b99241`
  - duel-type type id `0x726d6e4b30737e5caade98ee78f25fcfd7d495ea76971861768c4e267e20b0d1`
- **The current duel rules.** `duel-type` was then upgraded in place (its type id stays the same) to add skipped turns and block-time deadlines, and the artillery game was redeployed with the tower and skipped turns. The artillery game is in transaction `0xbdd9ca1cbff34f234659c5dbeb5f4d9254e92c30b68258ac68d593ca47bb4fb0` (data hash `0x1979b2698583fdcb24d5862eef66cd81cf74c3a3ef11a556626f013f059aed3c`). That `duel-type` is in transaction `0xa490bbd3d5ae390aff5bae29e8326d9ecb40874133ad9474cdfbb30507cbb5c6`.
- **The lap rules and per-game settings.** `match-type`, `bid-type`, `treasury-lock` and `duel-type` were upgraded in place, so their type ids stay the same. The new `lane-runner` went out as a new cell. Old games keep the old one. The upgrade is in transaction `0x2e39ef6ba56591cc29e5198e7428a723d7f959e5825ff759232eafac4d733563`.

## The screens

Most players are on phones, so the games are built for them.

- **Duels play sideways and fill the screen.** Held upright, the screen asks you to turn the phone.
- **Health is shown as blocks.** The wind sits at the top centre. You drag on the field to aim. Power and a big Fire button sit under your thumbs.
- **Players' real profile pictures**, read from the chain: their profile names a Spore, and the Spore holds the image. Players without one get a drawn face.
- **Watch replay** fires every stored shot again in order on the same board. The browser draws it, and CKB-VM is what checked it at the payout.
- **The lane runner is a daytime highway now.** The car is the Apex GT, built in code.
- **Watch the run on `/verify`.** The browser redraws a game from its transaction, next to the chain's checks. No server is asked.

## Where this stands

Everything above is running on Pudge testnet and still being tested. The rules and numbers can still change if testing shows a problem.
