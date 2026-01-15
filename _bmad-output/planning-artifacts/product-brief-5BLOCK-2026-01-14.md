---
stepsCompleted: [1, 2, 3, 4, 5, 6]
status: complete
completedAt: 2026-01-14
inputDocuments:
  - docs/user-stories.md
  - docs/user-stories/README.md
  - docs/specs/technical-requirements.md
  - docs/specs/smart-contracts.md
  - docs/specs/tech-stack.md
  - docs/user-stories/US-1.1-wallet-connect.md
  - docs/user-stories/US-1.2-wallet-disconnect.md
  - docs/user-stories/US-1.3-network-detection.md
  - docs/user-stories/US-2.1-pokemon-catalog.md
  - docs/user-stories/US-2.2-mint-card.md
  - docs/user-stories/US-2.3-inventory.md
  - docs/user-stories/US-2.4-card-details.md
  - docs/user-stories/US-3.1-create-offer.md
  - docs/user-stories/US-3.2-view-offers.md
  - docs/user-stories/US-3.3-accept-offer.md
  - docs/user-stories/US-3.4-cancel-offer.md
  - docs/user-stories/US-4.1-cooldown.md
  - docs/user-stories/US-4.2-card-lock.md
  - docs/user-stories/US-5.1-ipfs-storage.md
  - docs/user-stories/US-6.1-history.md
date: 2026-01-14
author: Naiki
---

# Product Brief: 5BLOCK

## Executive Summary

5BLOCK is a decentralized application (DApp) for trading tokenized Pokemon cards on the Ethereum blockchain. Unlike centralized card games where users never truly own their assets, or speculative NFT marketplaces that lack meaningful structure, 5BLOCK creates a **controlled digital economy** where ownership is verifiable, exchanges are fair, and rules are enforced by smart contracts rather than platform operators.

The project demonstrates a principled use of blockchain technology—not for financial speculation, but as a **neutral rule enforcer** that guarantees fairness, limits, and transparency by design. Users can mint cards from Generation 1 Pokemon (151 total), manage a limited collection (max 4 cards), and trade through a peer-to-peer marketplace governed by explicit constraints: 5-minute cooldowns between trades, 10-minute locks after acquisition, and immutable ownership history.

5BLOCK targets trading card enthusiasts who want real ownership, Web3 learners seeking practical blockchain applications, and developers exploring justified use cases beyond speculation. Success means users feel the system is fair, transparent, and game-like—a structured trading experience where the rules cannot be bypassed.

---

## Core Vision

### Problem Statement

Digital trading card platforms today fail to provide true ownership and transparent rule enforcement. Users face a fundamental trust problem:

- **Centralized platforms** (Hearthstone, Pokemon TCG Online) retain full control over assets—cards cannot be transferred externally, rules change unilaterally, and scarcity claims are unverifiable
- **NFT marketplaces** (OpenSea, Blur) offer ownership but no structure—unlimited hoarding, no cooldowns, no meaningful constraints, and pure speculation over utility
- **Blockchain TCGs** (Gods Unchained, Sorare) create complex ecosystems with high entry barriers, focusing on monetization rather than transparent, simple trading mechanics

The core problem is the **lack of enforceable, transparent rules** in digital collectible trading. Platforms claim to have rules, but users must trust operators to enforce them honestly.

### Problem Impact

Without provably enforced rules:

- Scarcity becomes a marketing claim, not a guarantee
- Ownership history can be hidden or manipulated
- Platform operators can change rules at will
- Users cannot verify fairness—they can only trust

This erodes confidence in digital collectibles and prevents meaningful trading experiences.

### Why Existing Solutions Fall Short

| Solution Type | Core Limitation |
|---------------|-----------------|
| Centralized card games | No true ownership; platform-controlled assets; opaque rule enforcement |
| NFT marketplaces | Ownership without structure; speculation over utility; no trading constraints |
| Blockchain TCGs | High complexity; monetization focus; rules enforced but not transparently exposed |

None combine **true ownership**, **simple mechanics**, and **transparent rule enforcement** in a single, accessible package.

### Proposed Solution

5BLOCK is a rule-bound digital card trading system where:

- **Ownership is cryptographically guaranteed** via ERC-721 tokens on Ethereum
- **Business rules are enforced by smart contracts**—not platform operators
- **Transaction history is immutable** and publicly verifiable
- **Constraints create meaningful gameplay**: max 4 cards per wallet, 5-minute trade cooldowns, 10-minute acquisition locks

The system transforms trading cards from platform-controlled items into **rule-bound digital assets** where fairness, limits, and history are guaranteed by design.

### Key Differentiators

| Differentiator | Description |
|----------------|-------------|
| **Blockchain as rule enforcer** | Smart contracts guarantee constraints that cannot be bypassed—not for hype, but for trust |
| **Deliberate scarcity** | Max 4 cards per wallet forces meaningful collection choices |
| **Anti-exploitation mechanics** | Cooldowns and locks prevent spam trading and instant flipping |
| **Transparent provenance** | On-chain ownership history visible to all participants |
| **Educational accessibility** | Simple mechanics demonstrate justified blockchain use cases |

5BLOCK proves that Web3 can be about **governance, limits, and trust**—not just tokens and speculation.

---

## Target Users

### Primary Users

#### Developer / Student Persona

**Profile:** Intermediate developer comfortable with JavaScript/TypeScript, new to Solidity but eager to apply it correctly. Building 5BLOCK as a course project (e.g., SUPINFO Web3 module), self-learning exercise, or early professional development.

**Goals:**
- Demonstrate understanding of token standards (ERC-721)
- Implement smart contract business rules (cooldowns, limits, validation logic)
- Integrate IPFS for decentralized storage
- Achieve comprehensive test coverage with Hardhat
- Design a coherent Web3 use case—not just "mint NFTs"

**What Success Looks Like:**
- Project compiles and all tests pass
- Constraints are respected and verifiable on-chain
- Can explain and justify each business rule during presentation or evaluation
- Repository becomes something they can cite, extend, and reference

**Why 5BLOCK Serves Them:**
- Clean, readable codebase designed for learning
- Every constraint has a clear purpose
- Learning happens through execution and failure, not theory
- Proves why blockchain matters via rules, not UI polish

---

### Secondary Users

#### Web3 Learner Persona

**Profile:** Beginner to intermediate blockchain user. Has tried MetaMask and maybe one or two DApps. Understands basic concepts but not smart contract logic.

**Frustrations:**
- Gas fees and transaction failures without clear explanations
- Overly complex interfaces
- DApps focused on speculation rather than learning
- Hard to understand why transactions succeed or fail

**What Success Looks Like:**
- Clear feedback when rules are violated
- Simple, understandable mechanics
- Seeing blockchain concepts applied to something familiar (trading cards)
- Learning by using, not reading documentation

---

#### Collector / Trader Persona

**Profile:** Familiar with physical trading cards (Pokemon, Yu-Gi-Oh, MTG). Some exposure to digital cards via centralized games. Values rarity, history, and fair exchanges.

**Frustrations:**
- No true ownership in existing platforms
- Cards disappearing when accounts are banned or games shut down
- No visibility into previous owners or card history
- Arbitrary trading restrictions decided by platform operators

**What Excites Them About 5BLOCK:**
- Verifiable ownership of cards
- Visible ownership history (provenance)
- Clear, enforced limits that make scarcity feel real
- A system closer to real card trading, not a black box

---

### User Journey (Primary Persona)

| Stage | Developer/Student Experience |
|-------|------------------------------|
| **Discovery** | Finds 5BLOCK through course assignment, GitHub exploration, or recommendation as a clean Web3 reference project |
| **Onboarding** | Clones repository, reads README + architecture overview, runs `npm install`, deploys contracts locally with Hardhat |
| **Core Usage** | Reads smart contracts, runs and extends unit tests, experiments with business rules (limits, cooldowns, transfers) |
| **"Aha!" Moment** | Transaction fails or succeeds purely because of an on-chain rule—realizes constraints are actually enforced |
| **Success** | Project compiles, tests pass, constraints respected, can explain and justify each rule during presentation |

**Why This Journey Works:**
- Project is understandable end-to-end
- Learning happens through execution and failure
- The DApp proves why blockchain matters via constraints, not UI polish
- Repository becomes a citable, extensible reference

---

## Success Metrics

### Definition of Success

5BLOCK is successful if a student can **build it, break it, explain it, and defend it**—and in doing so, demonstrate a real understanding of why blockchain is used and how smart contracts enforce trust.

---

### User Success Metrics (Developer/Student)

#### Target Outcomes

| Outcome | Measurement |
|---------|-------------|
| Course validation | Successfully pass Web3 course assignment with demonstrated understanding |
| Practical competency | Demonstrate tokenization, smart contract rules, IPFS integration, and Hardhat testing |
| Portfolio quality | Produce a project suitable for technical portfolio and professional presentation |

#### Definition of "Done"

A student has succeeded when:

- [ ] All required features are implemented and working:
  - Token creation with IPFS metadata
  - Ownership limits enforced (max 4 cards)
  - Exchange logic validated (create, accept, cancel offers)
  - Cooldown (5 min) and lock (10 min) mechanisms active
- [ ] Smart contracts compile and deploy locally without errors
- [ ] All unit tests pass successfully
- [ ] Student can clearly present and justify design choices

#### Learning "Aha" Moment

Success is demonstrated when the student:

1. **Experiences a meaningful revert** — a transaction fails for a precise on-chain reason
2. **Can explain the "why"** — articulates why a rule exists
3. **Can locate the "where"** — points to exactly where it's enforced in the contract
4. **Can reason about the "what if"** — explains what would break if the rule were removed

---

### Technical Benchmarks

| Benchmark | Success Criteria |
|-----------|------------------|
| **Test coverage** | Meaningful coverage focused on business rules, not line count |
| **Rule enforcement** | All business constraints enforced on-chain (not in frontend) |
| **IPFS integration** | Metadata correctly linked and retrievable via gateway |
| **Determinism** | Same inputs produce same results every time |
| **Gas efficiency** | Reasonable gas usage without unnecessary complexity |

---

### Documentation & Clarity Metrics

#### Onboarding Speed

A new student can complete the following in **under 30 minutes**:
1. Clone the repository
2. Install dependencies (`pnpm install`)
3. Deploy contracts locally (`npx hardhat node` + deploy script)
4. Run all tests (`npx hardhat test`)

#### Rule Documentation

Every major business rule is:
- Documented in specification files
- Referenced with comments in contract code
- Tested explicitly with dedicated test cases

#### Architectural Clarity

Clear separation between:
- **Business rules** — what constraints exist and why
- **Technical implementation** — how constraints are coded
- **Educational explanation** — documentation for learners

---

### Key Performance Indicators

| KPI | Target | Measurement Method |
|-----|--------|-------------------|
| Test pass rate | 100% | `npx hardhat test` returns all green |
| Contract deployment | Success on Hardhat local + Sepolia testnet | Deployment script completes without error |
| Onboarding time | < 30 minutes | Time from `git clone` to passing tests |
| Rule coverage | 100% of business rules have tests | Audit of test file vs. specification |
| Presentation readiness | Student can explain any rule on demand | Oral evaluation or demo |

---

## MVP Scope

### Core Principle

The MVP must prove one thing: **Business rules are enforced on-chain and cannot be bypassed.**

---

### Core Features (MVP)

#### Smart Contracts

| Feature | Description | Purpose |
|---------|-------------|---------|
| **Wallet Connection** | Single wallet type (MetaMask only) | Authenticate user identity |
| **Card Minting** | Create tokens with metadata, IPFS hash, and ownership assignment | Demonstrate ERC-721 tokenization |
| **Ownership Limits** | Max N cards per wallet, enforced on-chain | Prove constraint enforcement |
| **Peer-to-Peer Transfer** | Direct card exchange between wallets | Enable trading without intermediary |
| **Cooldown Mechanism** | Time delay between transactions | Prevent exploitation and spam |
| **Ownership History** | Previous owners stored on-chain | Demonstrate provenance tracking |

#### Testing & Validation

| Requirement | Description |
|-------------|-------------|
| **Unit Tests** | Comprehensive tests for all business rules |
| **Revert Tests** | Explicit tests for failure conditions (limits, cooldowns) |
| **Deployment Scripts** | Automated local deployment via Hardhat |

#### "Aha Moment" Definition

The MVP succeeds when a transaction **fails** because:
- Ownership limit is reached, OR
- Cooldown is active

And the reason is:
- **Visible** in the transaction error
- **Deterministic** (same inputs always produce same result)
- **Explainable** by reading the contract code

---

### Out of Scope for MVP

#### Intentionally Excluded

| Category | Excluded Items | Rationale |
|----------|---------------|-----------|
| **UI/UX** | Advanced UI, responsive design, visual polish | Functional correctness > aesthetics |
| **Infrastructure** | Multi-chain support, The Graph indexing | Unnecessary complexity for learning |
| **Wallet** | Multiple wallet providers (WalletConnect, etc.) | MetaMask sufficient for demo |
| **Marketplace** | Auctions, bids, pricing mechanisms | Beyond core transfer mechanics |
| **Real-time** | Notifications, live updates | Not required for rule demonstration |
| **Game Mechanics** | Battles, tournaments, competitive features | Outside educational scope |

#### Design Tradeoffs

| Priority | Over |
|----------|------|
| Functional correctness | UI polish |
| Smart contract clarity | Feature quantity |
| Rule enforcement demo | User experience optimization |
| Educational value | Production readiness |

---

### MVP Success Criteria

#### Completion Gate

MVP is **complete** when:

- [ ] **Smart Contracts**
  - Compile without errors
  - Deploy successfully to Hardhat local network

- [ ] **Unit Tests**
  - All tests pass
  - Explicitly test rule enforcement (success cases)
  - Explicitly test reverts (failure cases)

- [ ] **IPFS Integration**
  - Metadata is generated correctly
  - Metadata is linked to tokens via tokenURI

- [ ] **Demonstrability**
  - Can be demoed locally or on Sepolia testnet
  - Student can explain every rule end-to-end

#### Success Statement

> "All tests pass + constraints are provably enforced + student can explain every rule."

---

### Future Vision (Post-MVP)

The following enhancements are **intentionally deferred** to preserve MVP focus:

| Category | Potential Enhancements |
|----------|----------------------|
| **Deployment** | Public testnet (Sepolia) or mainnet deployment |
| **Content** | Additional card sets / Pokemon generations |
| **Marketplace** | Offer system, auctions, price discovery |
| **Gameplay** | Simple game mechanics using card stats |
| **Scale** | Multi-user scenarios, scalability testing |
| **Analytics** | Ownership patterns, trade flow visualization |

These represent natural evolution paths if the MVP succeeds as an educational reference, but are explicitly **not part of the current scope**.

