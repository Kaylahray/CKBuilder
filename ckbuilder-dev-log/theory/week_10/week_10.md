## CKB Builder Track Dev Log (Week 10)

- Name: Chioma Christopher
- Week Ending: 27-06-2026

#### What I worked on

This week I tried to make BitProof mint from the app itself. Last week `/mint` only showed me script steps to copy, so the goal was one click -- earn PROOF on CKB, click mint, get the badge on Bitcoin.

I built the operator mint API (`/api/rgbpp/mint-execute`) and the `lib/rgbpp` helpers behind it (operator BTC/CKB accounts, PROOF balance check, cluster lock-args resolver). The idea: the server runs the full RGB++ flow after checking my PROOF balance.

Being honest about where it landed: **the one-click in-app mint isn't reliable yet.** It keeps breaking on a cluster problem I didn't understand at first. The mint that actually works end-to-end is still the `rgbpp-sdk` script -- the app earns PROOF and shows the badge, but the script does the real minting. Most of my week went into understanding _why_ the in-app version breaks.

#### The thing that kept breaking

My mints kept failing with `bad-txns-inputs-missingorspent` and `(400) Invalid hex string`. I assumed it was funding or the wrong git branch. It wasn't either.

The real reason is how RGB++ clusters work: **minting a spore into a cluster consumes and recreates the cluster cell.** So:

- the cluster's Bitcoin anchor moves on every single mint,
- mints have to run one at a time,
- and if a mint sends its Bitcoin tx but never finishes the CKB side (because the SPV proof isn't ready yet), the anchor gets spent but the cluster never advances -- and every mint after that fails.

The original sdk script hid this. It wrapped the mint in `retry(20)` with the SPV wait in a background timer, so it fired ~20 Bitcoin txs in parallel. One went through, the rest failed on already-spent inputs, and my cluster ended up half-broken.

#### What I did about it

- Rewrote `2-create-cluster.ts` and `3-create-spores.ts` to run **once** and **wait properly** for the SPV proof before finalizing CKB (added `waitForRgbppSpvProof`). The script path is now reliable.
- Fixed a wrong `BtcAssetsApiError` import in the app so the mint retries while the proof is pending instead of giving up on the first try.
- Rebuilt a clean cluster from scratch and re-minted my Explorer badge with the script.

The in-app mint still isn't there. Even with the fixes, a single interrupted attempt spends the cluster anchor and I have to rebuild. Making it production-reliable needs a proper server-side queue and recovery, which is next week's problem.

#### What I understood about BitProof

BitProof is basically **POAP for CKB**: I earn PROOF, and the issuer mints my badge to me. POAP, Galxe OATs, and Guild badges all work this way -- the backend mints the credential, the user just owns it. For RGB++ that server-side mint is also what gives the cluster the one-at-a-time order it needs -- which is exactly why a half-finished mint is so fragile.

#### Final flow

| Step    | Route      | Status                                                                                                   |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| Earn    | `/quests`  | ✅ Works -- verify on-chain facts → claim PROOF from treasury                                            |
| Mint    | `/mint`    | ⚠️ UI + PROOF gate work; one-click operator mint not reliable yet -- badge minted via `rgbpp-sdk` script |
| Gallery | `/gallery` | ✅ Works -- paste `tb1q…` → badge loads from btc-assets-api                                              |

#### On-chain references (fresh Week 10 cluster)

- Cluster ID: `0xf55675586306a733c616d667b4b2f15c6c7a500aae4dd0d782d2274b1ff07b6e`
- Cluster create CKB tx: `0x4cc3db3d4ededee9ba12336483ae112e6fff5c390d5e0780ae58fa8ba1b019ac`
- Explorer spore CKB tx: `0xab49880c8f67472f97d907a51594c346b6751afd0e316f8dc51c024f60540c4b`
- My BTC wallet: `tb1qdrewnfzsgl83rmewseffmphrg680dj5laftx0d`

#### Final thought

I didn't get the one-click in-app mint working this week, and I'm not going to pretend I did. What I got instead was understanding _why_ it's hard: RGB++ cluster mints are serial by nature, and a mint that stops halfway leaves the anchor spent. The script mint is reliable, the app earns PROOF and shows the badge, and I now know exactly what a production-grade in-app mint needs -- a server-side queue and recovery. That's the real takeaway from Week 10.
