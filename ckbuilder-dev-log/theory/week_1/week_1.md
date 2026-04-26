## CKB Builder Track Dev Log (Week 1)

- Name: Chioma Christopher
- Week Ending: 26-04-2026

#### Courses Completed

- Introduction to Nervos CKB, The entire section of the CKB fundamental in documentation - transactions, consensus, execution, addreses, hashing, CKB-VM, CKB Vs BTC , Cell model.
- Completed the first three Lessons of the CKB Academy but I haven't finished exploring DOB (Digital objects).
- I also quickly Learnt about, wallet because I wanted to see a different appraoch to the task Neon gave to me earlier, which was to use the boilerplate and scaffold the transfer CKB, and I had to put my Private Key in the UI.

- completed two basic practice apps using CCC Connector for React
  - My First app is a basic transfer app and has a page where you can mint spores. For this particular application, the minted DOB shows in your wallet too.

  Here's the link

  https://ckb-transfer.vercel.app/

  For this I used my ID card that I created from project 2👇

  ![transfe](images/image-32.png)

  ![rr](images/image-33.png)

  ![check](images/image-34.png)

  This it how it looks in my wallet 👇

  ![okayy](images/image-35.png)
  - The second App I built is a SporeID app. A Basic Spore NFT minter that creates an "ID Card" Spore containing basic metadata (like Name and a short Bio).
    Its basically a way for to mint an onchain Identity card. Here, it shows perfectly in the UI but not wallet.

  Here's the link

  https://spore-id.vercel.app/

No wallet connected 👇

![empty](images/image-10.png)

I connected my wallet but I already had a Spore I created earlier 👇

![connect](images/image-18.png)

Minting new spore 👇

![choose](images/image-28.png)

demo

https://youtu.be/V_6gQnvJJ6o

It is recommended to compress files 😁

![compress](images/image-29.png)

![mint](images/image-30.png)

you can download the ID as pdf or png 👇

![download](images/image-31.png)

My ID 😁👀.

![myID](images/id.png)

- I'm still trying to understand this 👇 and might try exploring how to use spore sdk or any potential fix for the not supported. I didn't want to create two different cells(one for image and metadata), so i did it in One. I did try to use the spore sdk but I got several errors since it was initially built for nodejs runtime and I didn't want to do the Node-polyfills stuff yet.

  ![hmmm](images/image-36.png)

Now I'm hoping my second app displays everything, since I'm using one wallet and it did.

https://youtu.be/VelHjYNAkJY

### My Notes 👇

Introduction to Nervos CKB

I'll be starting with CKB fundamentals section of documentation.

![nervos](images/image-one.png)

a secure foundation that everything else builds on

Nervos solves the blockchain trilemma problem by splitting responsibilities into layers

![trilemma](images/image-two.png)

CKByte is NOT just a token

This part was really interesting.

On CKB:

> 1 CKByte = 1 byte of storage

So instead of just being “money,” CKB represents **space on the blockchain**.

![ckbyte](images/image-four.png)

In conclusion of this setion , in CKB we can use multiple programming languages and everything runs inside something called **CKB-VM**, which is based on RISC-V.

![ckbvm](images/image-ckbvm.png)

I'm moving on to the CELL MODEL section, I'll be adding images when going through CKB academy lesson 1 and two. for now here are they key points 👇

### Cells (CKB)

- Fundamental storage unit on CKB
- Contain
  - Data (tokens, information)
  - Capacity (CKBytes)
  - Scripts (rules)
- Replaces account-based model (e.g., Ethereum)

### Immutability

- Cells cannot be modified after creation
- Updates follow
  - Consume old cell
  - Modify data
  - Create new cell
- Model: destroy - recreate

### Cell States

- Live cell: available for use
- Dead cell: already consumed
- Consumed cells cannot be reused

### Transactions

- Represent state changes - state transformation
- Involve:
  - Consuming existing cells
  - Creating new cells
- No direct balance updates; state is replaced

### Scripts

- Lock script: defines ownership and access
- Type script: defines rules for data
- Scripts act as validators, not executable programs

### First-Class Assets

- Assets are owned by users, not contracts
- Protected by lock scripts even if contracts fail

### Fees

- Flexible fee model
- Fees can be paid by:
  - Sender
  - Receiver
  - Third party

### Scalability

- Off-chain computation
- On-chain verification
- Parallel transaction execution
- Supports batching operations

I'm moving on to CKB vs Bitcoin (UTXO vs Cell Model)

### UTXO vs Cell

- Bitcoin UTXOs:
  - Store only value
  - Have simple lock conditions
- CKB Cells:
  - Store tokens, data, and code
  - Represent application state, not just value
- Cells = extended, more flexible UTXOs

### Cell Structure

- Capacity (CKB)
- Lock script (ownership)
- Type script (rules, optional)
- Type script enables advanced functionality

### Execution Model

- Bitcoin:
  - Stack-based scripting
  - Limited functionality
- CKB:
  - CKB-VM (RISC-V based)
  - Runs general-purpose programs
  - Supports languages like Rust and JavaScript

### Scripts Comparison

- Bitcoin scripts:
  - Simple condition checks
- CKB scripts:
  - Complex logic
  - Can access transaction data
  - Return values:
    - 0 = valid
    - a non zero value is invalid.

### Transactions -2

- Both systems:
  - Consume old outputs
  - Create new outputs
- CKB focus:
  - State updates via Cells
- Rule:
  - Total output capacity ≤ total input capacity

### Verification

- Bitcoin:
  - Stack-based validation
- CKB:
  - Code-based validation (program logic)
- More expressive and flexible validation model

So, CKB is more like Bitcoin model + programmability. So CKB basically extends bitcoin design and maintains security while enabling complex applications

I'm moving to CKBVM

### CKB-VM

- Execution engine for all CKB scripts
- Runs compiled code and validates transactions

### Return Rule

- `0` = valid transaction
- non-zero = invalid transaction

### Architecture

- Built on RISC-V instruction set
- Low-level, hardware-like execution model

### Flexibility

- Supports advanced cryptography via libraries
- No protocol upgrades needed for new features

### Languages

- Any language that compiles to RISC-V:
  - Rust
  - C
  - others via toolchains

### Script Model

- Scripts are full programs
- They:
  - read transaction data
  - run logic
  - return validation result

Now I'm going over Consensus, Addresses, and Hashing briefly

- CKB addresses represent ownership logic, not just identity
- Ownership is defined by scripts, not accounts
- Consensus ensures global agreement across nodes
- CKB uses PoW with NC-MAX improvements
- Hashing guarantees data integrity and security
- Addresses are derived from Lock Scripts

I'm going to look into scripts now briefly

### Script vs Code

- A Script is not the actual code
- It contains:
  - code_hash (location of code)
  - hash_type (how to locate it)
  - args (inputs to the script)
- Actual executable code lives in a separate Cell
- Scripts act as references to code

### Lock Script (Ownership)

- Defines who can spend a Cell
- Unlocking process:
  - Provide witness data (e.g., signature)
  - Script verifies conditions
- If valid - Cell can be spent
- Similar to Bitcoin but more flexible

### Type Script (Logic)

- Defines rules for Cell behavior
- Controls:
  - Data updates
  - Token logic
  - State transitions
- Optional but powerful

### Key Difference

- Lock Script → ownership control
- Type Script → state and logic control
- Execution scope:
  - Lock Script: input cells only
  - Type Script: both inputs and outputs

### Data Hash vs Type Hash

- Data Hash:
  - Fixed code reference
  - Immutable
  - Safer
- Type Hash:
  - Upgradeable code reference
  - Flexible
  - Higher risk if misused

### Upgrade Risk

- Type Hash can allow code replacement
- Risk: malicious upgrades
- Mitigation:
  - Type ID ensures a single valid instance of code

### Script Arguments

- Passed into scripts as input parameters
- Common pattern:
  - args - public key or identifier
  - witness - signature

### Execution Model-2

- CKB groups inputs by script
- Each script runs once per group
- Improves efficiency and performance

### Syscalls

- Scripts cannot access data directly
- They use syscalls to read:
  - transaction inputs
  - witnesses
  - transaction context

I made more notes by concluding CKB Academy Lesson 1 and 2. 👇

![one](images/image-5.png)

reminder to myself: ckb is more like storage ownership than normal account balance.

![try](images/image-16.png)

you can't exceed capacity.👆

![ownership](images/image-6.png)

![summary](images/image-7.png)

quick checkpoint 👆

![where](images/image-8.png)

![types](images/image-11.png)

i mixed this up before, but hash_type really changes how code gets resolved.

![happens](images/image-12.png)

if dep code disappears, spending can break.

![transaction](images/image-13.png)

transaction mindset: consume old cells, create new cells. that's the state transition (transformation).

![script](images/image-14.png)

lock script = who can spend, type script = what state change is allowed.

![complete1](images/image-15.png)

![chap2](images/image-17.png)

chapter 2 felt more practical, less theory-heavy.

![transact](images/image-19.png)

real flow starts making sense here: build tx, sign it, push to network.

![tran](images/image-20.png)

noted for practice: always double-check inputs/outputs before signing.

![tt](images/image-21.png)

witness confused me at first, now i see it's basically proof attached for validation.

![hash](images/image-22.png)

tx hash is the tracking anchor. once i have it, i can verify everything on explorer.

![fin](images/image-23.png)

nice final flow diagram. i should repeat this process manually until it feels natural.

![wit](images/image-24.png)

![test](images/image-25.png)

this felt like my first "okay i can actually do this" moment.

![done](images/image-26.png)

week 1 wrap-up: Before wrapping up, i want to create a transfer app to see the structure of testnet transaction. since i did Fill in the blanks of the transaction in CKB Academy Lesson 2, I'm hoping it makes me understand it more.

I'm now scanning through to understand wallet since I'm moving away from how it was done using the boiler plate which used offckb acounts and users had to put their private key.

I have funded my wallet
![one](images/image.png)

my Quick App 😊

<!-- ![hi](images/image-1.png) -->

![two](images/image-2.png)

![thre](images/image-3.png)

I created another wallet to send tokens to 👇

![four](images/image-4.png)

![screen](images/screen.png)

👇 Now I want to view my transaction specifically because I want to see the lock script and see the raw transaction structure so i can compare it to the " FILL IN THE BLANKS" in CKB Academy Lesson 2👇

![six](images/image-six.png)

![seven](images/image-se.png)

- Moving on I'll try to solidify my knowledge and might dive into scripts.
