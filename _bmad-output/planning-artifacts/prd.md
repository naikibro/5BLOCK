---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation-skipped', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-5BLOCK-2026-01-14.md
  - docs/user-stories.md
  - docs/specs/technical-requirements.md
  - docs/specs/smart-contracts.md
  - docs/specs/tech-stack.md
  - docs/user-stories/README.md
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 0
  projectDocs: 6
classification:
  projectType: blockchain_web3
  domain: fintech
  complexity: high
  projectContext: brownfield
---

# Product Requirements Document - 5BLOCK

**Author:** Naiki
**Date:** 2026-01-14

---

## Executive Summary

### Vision

5BLOCK is a decentralized application (DApp) for trading tokenized Pokémon cards built on the Ethereum blockchain. The project serves as an **educational reference architecture** demonstrating how business rules can be enforced immutably on-chain.

### Product Differentiator

Unlike tutorials that show "how to build", 5BLOCK demonstrates **"why it works"** — every business rule is enforced in smart contracts, fully tested with both success and revert cases, and explainable by the developer.

**Core Principle:** Business rules enforced on-chain cannot be bypassed.

### Target Users

| Persona | Description | Primary Need |
|---------|-------------|--------------|
| **Developer/Student** | SUPINFO Web3 module student | Build, test, and defend a complete DApp |
| **Course Evaluator** | Instructor grading submissions | Verify genuine understanding vs. copy-paste |
| **Future Developer** | Junior dev seeking reference code | Learn smart contract patterns by example |

### Tech Stack Summary

- **Frontend:** Next.js 14 (App Router), TypeScript, wagmi/viem, shadcn/ui
- **Blockchain:** Solidity 0.8.20, Hardhat, OpenZeppelin
- **Storage:** IPFS via Pinata
- **Network:** Hardhat local (primary), Sepolia testnet (optional)

---

## Success Criteria

### User Success

**Primary Persona: Developer/Student**

Success is achieved when a student can **build it, break it, explain it, and defend it**.

**Measurable Outcomes:**
- All required features implemented and working (minting, ownership limits, exchange logic, cooldowns, locks)
- Smart contracts compile and deploy without errors
- All unit tests pass successfully
- Student can clearly present and justify design choices on demand

**The "Aha!" Moment:**
A student has succeeded when they:
1. **Experience a meaningful revert** — a transaction fails for a precise on-chain reason
2. **Can explain the "why"** — articulates why a rule exists
3. **Can locate the "where"** — points to exactly where it's enforced in the contract
4. **Can reason about the "what if"** — explains what would break if the rule were removed

### Business Success

**No hard business KPIs. Intentionally.**

5BLOCK succeeds even if only one student deeply understands Web3 because of it.

**Optional Non-Gating Indicators:**
- Repository forks (stronger signal than stars)
- Issues or PRs asking questions or proposing improvements
- Reused as reference in future course iterations
- README and docs sufficient for self-onboarding

### Technical Success

**Primary Metric (Gating):**
- 100% of business rules covered by at least one positive and one negative test

**Secondary Metric (Soft Guideline):**
- Line coverage ≥ 80% (not a gating condition)

**Rationale:** Line coverage alone is a weak indicator of learning. A single untested rule invalidates the educational value.

**Tests Must Explicitly Validate:**
- Ownership limits (max 4 cards)
- Cooldowns (5-minute trade cooldown)
- Lock constraints (10-minute acquisition lock)
- Transfer constraints and atomic swaps
- Failure/revert reasons with specific error messages

**If forced to choose: Rule coverage > line coverage.**

### Measurable Outcomes

| Outcome | Measurement |
|---------|-------------|
| Onboarding time | < 30 minutes from `git clone` to passing tests |
| Test pass rate | 100% |
| Rule coverage | 100% of business rules have positive + negative tests |
| Contract deployment | Success on Hardhat local + Sepolia testnet |
| Presentation readiness | Student can explain any rule on demand |

---

## Product Scope

### MVP Strategy & Philosophy

**MVP Approach:** Learning-Focused MVP

The MVP proves that **blockchain can enforce business rules that cannot be bypassed** — demonstrated through a complete, working DApp with full frontend, smart contracts, and tests.

**MVP Philosophy:**
- All features must be present to demonstrate the complete Web3 stack
- Quality of learning > breadth of features
- Every feature must be explainable and testable

**Resource Requirements:**
- Solo developer (course project context)
- Intermediate TypeScript/React skills
- Beginner Solidity skills (learning as you build)

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Developer/Student — Happy Path (full onboarding to completion)
- Developer/Student — Debugging Path (understanding reverts)
- Course Evaluator — Validation Path (grading and verification)
- Future Developer — Fork/Extension Path (reusability)

**Must-Have Capabilities:**

| Epic | Features | MVP Status |
|------|----------|------------|
| **Epic 1: Wallet** | Connect, Disconnect, Network Detection | Required |
| **Epic 2: Cards** | Catalog, Mint, Inventory, Card Details | Required |
| **Epic 3: Marketplace** | Create Offer, View Offers, Accept, Cancel | Required |
| **Epic 4: Time Constraints** | Cooldown (5min), Lock (10min) | Required |
| **Epic 5: IPFS** | Metadata storage via Pinata | Required |
| **Epic 6: History** | Transaction events, Ownership history | Required |

**Frontend Requirements:**
- Full Next.js 14 application (App Router)
- All routes implemented: `/`, `/catalog`, `/inventory`, `/trade`, `/history`
- Responsive enough to work on desktop (mobile polish deferred)
- shadcn/ui components for consistent UI

**Smart Contract Requirements:**
- PokemonCards.sol fully implemented with all constraints
- TradeMarket.sol fully implemented with cooldowns
- All custom errors and events defined
- NatSpec documentation complete

**Testing Requirements:**
- 100% business rule coverage (positive + negative tests)
- Deployment scripts for Hardhat local

**Network Requirements:**
- Hardhat local (chainId 31337) — required
- Sepolia testnet — optional/deferred

### Post-MVP Features (Phase 2)

| Feature | Rationale for Deferral |
|---------|----------------------|
| Sepolia deployment | Local is sufficient for course evaluation |
| WalletConnect | MetaMask is sufficient for desktop |
| Offer filtering/search | Basic list view is sufficient for MVP volume |
| Responsive mobile UI | Desktop-first for development |
| Additional Pokémon generations | Gen 1 (151) is sufficient |

### Vision Features (Phase 3 — Out of Scope)

| Feature | Rationale |
|---------|-----------|
| Game mechanics | Not required for learning objectives |
| Multi-user scalability | Educational volume doesn't require it |
| Analytics/visualization | Nice-to-have, not educational core |
| Mainnet deployment | Explicitly excluded |

### Risk Mitigation Strategy

**Technical Risks:**

| Risk | Mitigation |
|------|------------|
| IPFS pinning failures | Use Pinata with retry logic; fallback to local metadata in tests |
| MetaMask connection issues | Clear error messages; documented troubleshooting |
| Time manipulation in tests | Use `@nomicfoundation/hardhat-network-helpers` |
| Contract deployment complexity | Single deploy script with clear output |

**Educational Risks:**

| Risk | Mitigation |
|------|------------|
| Student can't explain code | NatSpec comments + test comments explaining "why" |
| Tests pass but understanding fails | Require revert tests, not just success tests |
| Scope creep during development | Strict MVP definition; defer all "nice-to-haves" |

**Resource Risks:**

| Risk | Mitigation |
|------|------------|
| Time constraints | Prioritize smart contracts + tests over UI polish |
| Complexity overwhelm | Follow epic order: Wallet → Cards → Marketplace → Constraints |
| Debugging difficulty | Custom errors with context; console logs in tests |

### Scope Boundaries Summary

**In Scope (MVP):**
- Full Next.js frontend with all routes
- Both smart contracts fully implemented
- All 6 epics / 16 user stories
- Hardhat local deployment
- Complete test suite

**Explicitly Out of Scope:**
- Sepolia/mainnet deployment
- Mobile-responsive UI
- WalletConnect
- Advanced marketplace features
- Game mechanics
- Analytics

---

## User Journeys

### Journey 1: Developer/Student — Primary Happy Path

**Persona: Alex, 22, SUPINFO Web3 Student**

Alex is an intermediate developer comfortable with TypeScript and React. They've built a few frontend projects but never touched Solidity. The Web3 module assignment requires demonstrating tokenization, smart contract rules, and decentralized storage. Alex wants to build something they can actually explain during evaluation — not just copy-paste from a tutorial.

**Opening Scene:**
Alex receives the assignment brief. The requirements mention ERC-721, ownership limits, cooldowns, IPFS, and Hardhat tests. They feel a mix of excitement and overwhelm — this is their first "real" blockchain project.

**Rising Action:**

1. **Discovery** — Alex clones the 5BLOCK repository and reads the README. The setup instructions are clear: `pnpm install`, `npx hardhat node`, deploy script.

2. **First Success** — Within 20 minutes, Alex has a local node running and contracts deployed. They mint their first Pokémon card. MetaMask pops up, they sign, and a Pikachu NFT appears in their inventory. *"Wait, I actually own this on-chain?"*

3. **Exploration** — Alex reads through `PokemonCards.sol`. The code is annotated. They trace how `mint()` checks `ownedCount < MAX_CARDS_PER_WALLET`. They understand the modifier pattern.

4. **Testing** — Alex runs `npx hardhat test`. All tests pass. They read through the test file and see both success cases and revert cases. They modify a test to expect the wrong error — it fails. *"So the tests actually verify specific behaviors."*

5. **Building** — Alex adds a new card to their collection, then another. They try to mint a 5th card. The transaction reverts: `MaxCardsReached`. They check the contract — the limit is enforced exactly where expected.

**Climax:**
Alex creates a trade offer. They wait 5 minutes (or manipulate time in Hardhat), accept from another wallet, and watch an atomic swap execute. Both cards change hands in a single transaction. They check `previousOwners` — the history is immutable. *"This is why blockchain matters. The rules can't be cheated."*

**Resolution:**
Alex completes all features, writes additional tests for edge cases they discovered, and prepares their presentation. They can trace any rule from specification → contract code → test → UI feedback. They feel ready to defend every design choice.

**Journey Reveals:**
- Onboarding flow must be < 30 minutes
- Code must be readable and annotated
- Tests must be examples, not just validators
- UI must surface contract errors clearly

---

### Journey 2: Developer/Student — Debugging & Revert Path

**Persona: Alex (same student, different day)**

Alex is debugging a failing test they wrote. The transaction reverts, but they don't understand why.

**Opening Scene:**
Alex writes a test for a new edge case: "What happens if someone tries to accept an offer for a card that's still locked?" They expect it to work, but the test fails with `CardLocked`.

**Rising Action:**

1. **Confusion** — The error message says `CardLocked(tokenId, lockUntil)`. Alex isn't sure which card is locked or why.

2. **Investigation** — Alex opens `TradeMarket.sol` and searches for `CardLocked`. They find the check in `acceptOffer()`: both the maker's and taker's cards must be unlocked.

3. **Tracing** — Alex adds a console log in their test to print `getLockUntil()` for both cards. They discover the taker's card was minted 2 minutes ago — still within the 10-minute lock.

4. **Hypothesis** — Alex adds `time.increase(10 * 60)` before the accept call. The test passes.

5. **Understanding** — Alex re-reads the specification. The lock exists to "prevent rapid flipping and stabilize trades." They understand the *why*, not just the *what*.

**Climax:**
Alex realizes they can explain exactly:
- **What** failed (CardLocked revert)
- **Where** it's enforced (TradeMarket.sol line 145)
- **Why** the rule exists (anti-exploitation)
- **What if** it were removed (instant card flipping, unstable marketplace)

**Resolution:**
Alex documents this edge case in their test file with a comment explaining the business rule. They add a second test that verifies the lock *prevents* immediate trading. They feel confident they could answer any question about this mechanism.

**Journey Reveals:**
- Error messages must include context (tokenId, lockUntil timestamp)
- Custom errors are essential for debugging
- Tests must cover revert conditions explicitly
- Documentation must explain *why*, not just *what*

---

### Journey 3: Course Evaluator/Instructor — Validation Path

**Persona: Dr. Martin, SUPINFO Web3 Course Instructor**

Dr. Martin has 15 student submissions to evaluate. They have 20 minutes per project. They need to quickly assess: Does this student understand Web3 principles, or did they just copy working code?

**Opening Scene:**
Dr. Martin opens Alex's repository. They see a standard structure — contracts, tests, frontend. But they've seen 10 of these already today. What makes this one worth a good grade?

**Rising Action:**

1. **Quick Scan** — Dr. Martin reads the README. Clear setup instructions. They run `pnpm install && npx hardhat test`. All tests pass in 30 seconds. *"At least it works."*

2. **Rule Verification** — Dr. Martin opens the test file. They search for "revert". They find explicit tests for:
   - `MaxCardsReached` when minting 5th card
   - `CardLocked` when trading too soon
   - `CooldownActive` when acting within 5 minutes

   Each test has a comment explaining the business rule. *"Good — they tested failure cases, not just success."*

3. **Code Review** — Dr. Martin opens `PokemonCards.sol`. The code uses NatSpec comments. The constants are clearly named. The `_update()` override handles ownership tracking. *"Clean. They understood the ERC-721 hooks."*

4. **Spot Check** — Dr. Martin asks a question via the assignment system: "What happens if both users in a swap already have 4 cards each?"

5. **Student Response** — Alex explains: "The swap is atomic. User A gives 1 card, receives 1 card — net zero change. The `_update()` hook checks limits after decrementing the sender's count but before incrementing the receiver's. So a 4-for-4 swap works, but if either user would exceed 4, the transaction reverts."

**Climax:**
Dr. Martin asks: "Where exactly is this enforced?" Alex points to line 85 in `PokemonCards.sol`. Dr. Martin verifies. The answer is correct and precise.

**Resolution:**
Dr. Martin marks the submission as demonstrating genuine understanding. The student didn't just make it work — they can explain *why* it works and *where* the rules live. This is the distinction between a passing grade and an excellent one.

**Journey Reveals:**
- Tests must be scannable for rule coverage
- Code must be self-documenting (NatSpec, clear naming)
- Revert tests prove understanding
- Student must be able to answer "where is this enforced?"

---

### Journey 4: Future Developer (Fork User) — Extension Path

**Persona: Sam, Junior Developer, 6 months later**

Sam is learning Solidity and finds 5BLOCK on GitHub while searching for "ERC-721 with business rules example." They want to understand how to implement constraints in smart contracts.

**Opening Scene:**
Sam lands on the repository. They see "educational reference" in the description. The README promises a "rule-driven smart contract architecture." This sounds exactly like what they need.

**Rising Action:**

1. **First Impression** — Sam reads the README. Clear problem statement, architecture overview, and setup instructions. They understand what 5BLOCK does without running it.

2. **Code Dive** — Sam opens `PokemonCards.sol`. They see `MAX_CARDS_PER_WALLET = 4` and immediately understand the ownership limit. The `checkLimit` modifier is self-explanatory.

3. **Learning** — Sam reads through `TradeMarket.sol`. They see how cooldowns are implemented via timestamps. They notice the `checkCooldown` modifier pattern — *"I could reuse this for my own project."*

4. **Testing** — Sam runs the test suite. They modify a test to see what happens if they remove the cooldown check. The test fails. They add the check back. The test passes. *"So this is how to validate business rules."*

**Climax:**
Sam decides to fork and extend: they want to add a "burn" feature that lets users destroy cards. They know exactly where to add the function, what checks to include, and how to test it — because the existing code taught them the pattern.

**Resolution:**
Sam creates a PR to their fork. The code follows the same structure as the original. They add tests for both success and revert cases. They've learned more about smart contract design from 5BLOCK than from any tutorial.

**Journey Reveals:**
- README must explain architecture, not just setup
- Code patterns must be consistent and reusable
- Tests must serve as documentation/examples
- Repository must be forkable without modification

---

### Journey Requirements Summary

| Journey | Key Capabilities Revealed |
|---------|---------------------------|
| **Developer/Student — Happy Path** | Onboarding flow, readable code, clear UI feedback, passing tests |
| **Developer/Student — Debugging** | Contextual error messages, custom errors, documented test cases |
| **Course Evaluator** | Scannable tests, self-documenting code, verifiable rule enforcement |
| **Future Developer (Fork)** | Architectural clarity, reusable patterns, example-driven tests |

**Cross-Journey Requirements:**
- All business rules must be testable in isolation
- Error messages must include diagnostic context
- Code must be annotated for learning
- Tests must demonstrate both success and failure
- Documentation must explain *why*, not just *how*

---

## Domain-Specific Requirements

### Blockchain/Web3 Context

5BLOCK operates in the blockchain domain with an **educational scope** — not production DeFi. This section documents Web3-specific requirements appropriate for a learning reference project.

### 1. Deterministic Rule Enforcement

**Requirement:** Every business constraint must be enforced in the smart contract, not in the UI or scripts.

**Implementation:**
- Custom errors with stable, descriptive names that tests can assert against
- Example: `error CooldownActive(address wallet, uint256 remainingTime);`
- Event + Error pairing strategy:
  - **Events** for successful state changes (CardMinted, TradeAccepted)
  - **Errors** for rejected actions (no events on revert)

**Why it matters:** Supports the "aha moment" — students see deterministic failures with traceable causes.

### 2. Time-Based Rules

**Requirement:** Cooldowns and locks use `block.timestamp` with documented limitations.

**Implementation:**
- Use `>=` comparisons for time checks
- Store explicit `nextAllowedAt` or `lockUntil` timestamps (not durations)
- Document miner timestamp skew (~15 seconds tolerance)

**Testing Requirements:**
- Test "just before cooldown ends" → should fail
- Test "just after cooldown ends" → should succeed
- Use Hardhat's `time.increase()` for deterministic time manipulation

### 3. Token Standard Choice

**Decision:** ERC-721 (unique tokens)

**Rationale:**
- Each card is unique with its own tokenId, ownership history, and lock state
- ERC-1155 would be appropriate if cards were interchangeable by type, but they are not
- Rarity/type represented as on-chain metadata and IPFS attributes

### 4. IPFS Integrity

**Policy:** Immutable metadata

**Implementation:**
- `tokenURI` points to an IPFS CID that never changes after mint
- Image and metadata pinned to Pinata before minting
- No URI update mechanism (intentionally immutable)

**Validation:**
- Basic CID format validation in frontend before mint
- Tests verify token points to expected CID format (`ipfs://Qm...`)

### 5. History Tracking Strategy

**Approach:** On-chain array (simple, acceptable for educational scope)

**Implementation:**
- `previousOwners[tokenId]` stores array of past owner addresses
- Updated in `_update()` hook on every transfer
- Growth is unbounded but acceptable for low-volume educational use

**Trade-offs documented:**
- On-chain array: Simple, directly queryable, storage cost grows with trades
- Event-based derivation: More scalable, requires off-chain indexing
- For educational scope, on-chain storage is clearer and easier to test

### 6. Authorization Model

**Approach:** Standard ERC-721 approval flow via OpenZeppelin

**Implementation:**
- Transfers require `msg.sender` is owner OR approved operator
- TradeMarket contract must be approved to transfer cards
- No custom permission model — use standard patterns

### 7. Marketplace Mechanics

**Scope:** Offer/Accept pattern (minimal safe primitive)

**Implementation:**
- Seller creates offer specifying their card and desired card
- Buyer accepts offer, triggering atomic swap
- No auctions, bids, or pricing mechanisms (out of scope)

### 8. Upgradeability

**Decision:** NOT used (intentionally)

**Rationale:**
- Proxy patterns add complexity inappropriate for educational scope
- Immutability is intentional — changes require redeploy
- Students should understand deployed contracts are permanent

---

## Blockchain/Web3 Project-Type Requirements

### Chain Specification

| Network | Chain ID | Purpose |
|---------|----------|---------|
| Hardhat Local | 31337 | Primary development and testing |
| Sepolia Testnet | 11155111 | Optional public testnet deployment |
| Mainnet | — | Explicitly out of scope |

**RPC Configuration:**
- Local: `http://127.0.0.1:8545`
- Sepolia: QuickNode endpoint (via environment variable)

### Wallet Support

**Primary Connector:** MetaMask (browser extension)

| Aspect | Implementation |
|--------|----------------|
| Connector | wagmi `injected({ target: 'metaMask' })` |
| Chain switching | `useSwitchChain()` hook |
| Connection state | `useAccount()`, `useConnect()`, `useDisconnect()` |
| Transaction signing | wagmi `useWriteContract()` |

### Smart Contract Architecture

**Contracts:**

| Contract | Standard | Purpose |
|----------|----------|---------|
| PokemonCards.sol | ERC-721 + URIStorage | NFT minting, ownership limits, locks, history |
| TradeMarket.sol | Custom | Offer/accept atomic swaps with cooldowns |

**Inheritance Chain:**
```
PokemonCards
├── ERC721
├── ERC721URIStorage
├── Ownable
└── ReentrancyGuard

TradeMarket
└── ReentrancyGuard
```

**Contract Interaction Pattern:**
- TradeMarket calls PokemonCards for ownership verification
- TradeMarket requires approval to transfer cards on behalf of users
- PokemonCards owner sets TradeMarket address via `setTradeMarket()`

### Gas Optimization Strategy

**Philosophy:** Learning-appropriate, not hyper-optimized

| Technique | Used | Rationale |
|-----------|------|-----------|
| Custom errors | Yes | Gas efficient + educational clarity |
| Optimizer (200 runs) | Yes | Standard setting |
| Storage packing | No | Clarity over micro-optimization |
| Assembly | No | Too complex for educational scope |
| calldata vs memory | Yes | Standard best practice |

**Priority:** Code clarity > gas savings

### Security Model (Educational Level)

**Protections Implemented:**
- OpenZeppelin battle-tested contracts
- ReentrancyGuard on all state-changing external functions
- Explicit ownership checks before transfers
- Custom errors with context for debugging

**Explicitly Not Implemented:**
- Formal security audit
- Fuzzing or property-based testing
- MEV protection
- Upgradeable proxies

### Frontend-Blockchain Integration

**Stack:** wagmi 2.x + viem 2.x + @tanstack/react-query 5.x

**Key Patterns:**
- `useReadContract()` for on-chain data
- `useWriteContract()` for transactions
- `useWaitForTransactionReceipt()` for confirmation
- `useWatchContractEvent()` for real-time updates

**Error Handling:**
- Parse contract revert reasons from transaction errors
- Display user-friendly messages mapped from custom errors
- Show transaction status (pending, confirmed, failed)

### Development Workflow

1. Start local Hardhat node (`npx hardhat node`)
2. Deploy contracts (`npx hardhat run scripts/deploy.ts --network localhost`)
3. Configure frontend with deployed addresses
4. Connect MetaMask to localhost:8545

**Testing Strategy:**
- Unit tests in Hardhat (Chai + Mocha)
- Time manipulation via `@nomicfoundation/hardhat-network-helpers`
- Gas reporting via `REPORT_GAS=true`

---

## Functional Requirements

### Wallet Management

- **FR1:** User can connect their MetaMask wallet to the application
- **FR2:** User can disconnect their wallet from the application
- **FR3:** User can view their connected wallet address
- **FR4:** User can see the current network they are connected to
- **FR5:** System detects wrong network and prompts user to switch

### Card Catalog & Discovery

- **FR6:** User can browse the complete Pokémon Generation 1 catalog (151 Pokémon)
- **FR7:** User can view Pokémon details including name, type, and stats (HP, Attack, Defense)
- **FR8:** User can see calculated rarity tier for each Pokémon
- **FR9:** User can see which Pokémon they have already minted
- **FR10:** User can filter/search catalog by Pokémon name or ID

### Card Minting

- **FR11:** User can mint a Pokémon card as an NFT
- **FR12:** System enforces maximum 4 cards per wallet during minting
- **FR13:** System pins card metadata to IPFS before minting
- **FR14:** User can see their current card count and remaining slots
- **FR15:** System displays clear error when user attempts to exceed card limit

### Card Inventory

- **FR16:** User can view all cards they currently own
- **FR17:** User can view detailed information for each owned card
- **FR18:** User can see lock status and remaining lock time for each card
- **FR19:** User can see ownership history (previous owners) for each card
- **FR20:** User can see card metadata including IPFS-stored attributes

### Marketplace - Offer Creation

- **FR21:** User can create a trade offer specifying their card and desired card
- **FR22:** User can view their active outgoing offers
- **FR23:** User can cancel their own pending offers
- **FR24:** System enforces 5-minute cooldown between trade actions
- **FR25:** System displays clear error when cooldown is active

### Marketplace - Offer Discovery

- **FR26:** User can view all available trade offers from other users
- **FR27:** User can see offer details (offered card, requested card, maker address)
- **FR28:** User can identify which offers request cards they own

### Marketplace - Trade Execution

- **FR29:** User can accept an offer that matches a card they own
- **FR30:** System executes atomic swap (both cards transfer in single transaction)
- **FR31:** System verifies both cards are unlocked before swap
- **FR32:** System updates ownership history for both cards after swap
- **FR33:** System applies 10-minute lock to newly acquired cards

### Time Constraints

- **FR34:** System enforces 5-minute cooldown between user's trade actions
- **FR35:** System enforces 10-minute lock on newly acquired cards
- **FR36:** User can see remaining cooldown time before next trade action
- **FR37:** User can see remaining lock time for each card
- **FR38:** System displays contextual error messages with time remaining

### Transaction History

- **FR39:** User can view their transaction history (mints, trades)
- **FR40:** User can view ownership provenance for any card
- **FR41:** User can see timestamps for all historical events

### Error Handling & Feedback

- **FR42:** System displays clear, actionable error messages for all failed transactions
- **FR43:** System shows transaction status (pending, confirmed, failed)
- **FR44:** System parses and displays human-readable contract revert reasons

---

## Non-Functional Requirements

### Performance

**Frontend Performance:**
- Page navigation completes within 1 second
- UI remains responsive during blockchain transactions (non-blocking async)
- Catalog loads and renders within 2 seconds

**Blockchain Transactions:**
- Transaction confirmation feedback within 15 seconds on local Hardhat
- Clear pending states during transaction processing
- No UI freezing during wallet interactions

**Data Loading:**
- Cached contract reads for static data (card metadata)
- React Query caching for repeated reads
- IPFS metadata fetched once per card, cached locally

### Integration Reliability

**PokeAPI:**
- Handle API downtime gracefully (cached fallback for Gen 1 data)
- Rate limiting awareness (respectful API usage)
- Clear error messaging if API unavailable

**Pinata IPFS:**
- Retry logic for pin failures (1-2 retries)
- Validate CID format before minting
- Handle gateway timeouts with user feedback

**MetaMask:**
- Detect extension presence
- Handle rejected transactions gracefully
- Clear messaging for network mismatch
- Support manual network switching

### Testability

**Smart Contract Testing:**
- All business rules have explicit test coverage
- Tests are deterministic and repeatable
- Time-based tests use Hardhat helpers
- Tests document expected behavior in comments

**Test Environment:**
- Single command to run full test suite (`pnpm hardhat test`)
- Gas reporting available via environment flag
- Test isolation (no cross-test state pollution)

### Maintainability

**Code Readability:**
- NatSpec comments on all public contract functions
- TypeScript strict mode enabled
- Consistent code style (Prettier + ESLint)
- Self-documenting variable and function names

**Project Structure:**
- Clear separation: contracts/, frontend/, tests/
- Deployment scripts documented and idempotent
- Environment variables documented in README

**Documentation:**
- README explains setup in < 30 minutes
- Architecture decisions documented (why, not just what)
- Test files serve as behavior documentation

### Security (Educational Level)

**Smart Contract Security:**
- OpenZeppelin contracts for standard patterns
- ReentrancyGuard on state-changing functions
- Explicit access control checks
- Custom errors with diagnostic context

**Frontend Security:**
- No sensitive data stored client-side
- Input validation before contract calls
- Clear transaction preview before signing

**Explicitly Out of Scope:**
- Formal security audit
- Fuzzing or property-based testing
- MEV protection mechanisms
- Production-grade key management
