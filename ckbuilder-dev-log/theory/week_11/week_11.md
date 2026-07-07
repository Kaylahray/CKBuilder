## CKB Builder Track Dev Log (Week 11)

- Name: Chioma Christopher
- Week Ending: 05-07-2026

#### What I worked on

Week 11 was a pivot away from BitProof. I paused there. This week I started looking into **Fiber Network** and the **Fiber Infrastructure Hackathon** (1–15 July).

Most of the week was orientation: reading the hackathon brief, going through Nervos/Fiber docs, and getting my head around what Fiber actually is and how it fits on top of CKB. I also had several syncs with my teammate to talk through ideas, review what we'd each read, and start shaping a plan for what we could realistically build in the hackathon window. We're aligned on direction at a high level; more concrete updates on what we're building coming soon.

For the hackathon we are to Build reusable infrastructure that makes Fiber easier to use, integrate, operate, or productise.

Part 1 is infrastructure only -- wallets, routing/diagnostics, merchant/liquidity tooling. Apps come in a later phase. Judges care about whether it helps **other developers** reuse it, whether it's **actually working** vs mocked, and whether there's clear docs, a demo, and an open-source repo.

My teammate and I spent time in sync reviewing the different categories and sketching what would be realistic for us given our stack (Next.js, CKB wallet patterns from earlier weeks) and the ~12-day window.

#### Team syncs

We had several calls this week to:

- Share what we'd each learned from the Fiber docs and hackathon brief
- Compare notes on Category 1 vs 2 vs 3 and where we had the most to contribute
- Rough out a split of responsibilities and a timeline for the hackathon week
- Agree to start hands-on work -- running a node, first RPC calls -- before locking in the final submission angle

I'll have more detail on what we're actually building once we've run through the basics on a live node.

Week 11 was about stepping into a new layer of the stack. BitProof taught me that payment-like flows break in silent, technical ways -- Fiber is where Nervos is solving that properly for L2. I spent the week learning, syncing with my teammate, and starting to build. The hackathon deadline is tight, but we're past the "just reading docs" phase. More on what we're shipping next log.