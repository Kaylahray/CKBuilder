# CKB Builder Track Dev Log — Week 15

- Name: Chioma Christopher
- Week ending: 19-08-2026
- Project: Chain Letter / Keepers Relay
- Live app: [keepers-relay.vercel.app](https://keepers-relay.vercel.app)
- Testnet tx: [0x68f763f4…7acc](https://pudge.explorer.nervos.org/transaction/0x68f763f4d15bbfe3b2922a0beb6a22847ad2202fc79f81f1550f938054437acc)

---

This week I made real progress on Chain Letter. The on-chain parts are live now and the product is running on top of them.

You can open the app, connect a wallet, claim a @handle, start a streak, seal a mark, and pass the Cell to someone else. Every one of those actions either creates or spends a real CKB Cell on Pudge testnet. The rules are enforced by a Rust type script at the consensus layer.

The biggest thing I built this week was the seal transition. Before, a Keeper could only commit a mark during a pass. Now the type script has a dedicated path where the current Keeper can stamp a mark into the Cell without spending it or changing the owner. The Cell just updates its `artifact_root`, which is a hash that chains every mark ever sealed into one fingerprint. If you want to verify the full history later, you replay the events from the indexer and recompute the hash. If it matches what is on the Cell, nothing was touched. You do not have to trust the app. The proof is in the Cell.

Other things shipped this week: pass recipient now has a community member search, holder detection was broken and is fixed, onboarding is down to one wallet signature instead of two, there is a hamburger menu on mobile, and you can burn your username Cell from Studio to reclaim the CKB and free up the handle.

What still needs work: the app reads chain state from its own database instead of the CKB indexer directly. Expiry is enforced in the app for now. The PROOF treasury is a soft counter. The path forward on all of these is clear, it is just execution from here.

---

Now for the part that matters to me most.

I wa asked if this is Spore. It is not. Spore is for objects that do not change. You put a file on-chain, it lives there forever, only the owner can move or melt it. Spore is great at that. That is what it was built for.

What I built is for objects that evolve. Things with a lifecycle. Things where the rules of transfer are part of the contract. With Chain Cell, you cannot pass to yourself. The new owner's deadline must advance by exactly one window. The mark history can only grow, it can never be rewritten. These rules live in the type script, not in the app. Nobody can override them, including me.

Here is the thing: CKB's Cell model is genuinely the best place in crypto to build this kind of object. Each object is its own Cell. Ownership lives at the base layer. The type script runs on every transaction and rejects anything that breaks the rules. On Ethereum you get storage slots that an admin key can rewrite. On CKB you get this.

And not surre nobody has built the convention layer for it yet. Spore covers static objects. There is nothing for evolving ones. No shared data layout. No standard transition rules. No SDK. Every team that wants to build something like this starts from scratch and reinvents everything.

That gap is what this project is starting to fill. Chain Letter is the first object type, the proof that the pattern works. The same underlying structure, with different state fields and different transition rules, could be a credential, an escrow, a membership pass, a game character. Any object that needs to change over time under rules nobody can override.

 What comes next is extracting the SDK and building a second object type to prove it generalises. 

**Keep it alive. Leave a mark. Pass it on.**
