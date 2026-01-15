---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - docs/specs/technical-requirements.md
  - docs/specs/smart-contracts.md
  - docs/specs/tech-stack.md
  - docs/user-stories.md
  - _bmad-output/planning-artifacts/product-brief-5BLOCK-2026-01-14.md
---

# 5BLOCK - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for 5BLOCK, a decentralized Pokémon card trading DApp built on Ethereum. It decomposes the requirements from the PRD (technical-requirements.md), Architecture (smart-contracts.md), and existing user stories into implementable stories.

## Requirements Inventory

### Functional Requirements

**Token Management (Cards)**
- FR-001: The system must allow minting tokens representing Pokémon cards
- FR-002: Each token must have a `pokemonId` corresponding to PokeAPI ID (1-151)
- FR-003: Each token must have a `rarityTier` calculated from stats
- FR-004: Each token must have a `value` calculated (HP + Attack + Defense)
- FR-005: Each token must point to metadata JSON on IPFS via `tokenURI`
- FR-006: Timestamps `createdAt` and `lastTransferAt` must be stored on-chain

**Ownership Constraints**
- FR-010: A wallet cannot own more than **4 cards** simultaneously
- FR-011: Minting must be rejected if wallet reaches 4-card limit
- FR-012: Transfer must be rejected if recipient would exceed 4 cards

**Temporal Constraints**
- FR-020: A **5-minute cooldown** must apply between trade actions per wallet
- FR-021: Actions subject to cooldown: `createOffer`, `cancelOffer`, `acceptOffer`
- FR-022: Minting is **not** subject to cooldown
- FR-023: A card must be **locked 10 minutes** after acquisition (mint or trade)
- FR-024: A locked card cannot be proposed or used in a trade

**Trade Marketplace**
- FR-030: User can create a trade offer specifying their card and desired card
- FR-031: An offer has status: `Open`, `Cancelled`, `Accepted`
- FR-032: Only the offer creator can cancel it
- FR-033: Trade must be **atomic** (both transfers in same transaction)
- FR-034: On acceptance, system must verify maker still owns their card
- FR-035: On acceptance, system must verify taker owns the requested card

**Traceability**
- FR-040: Ownership history (`previousOwners`) must be maintained on-chain
- FR-041: Events must be emitted for: mint, offer creation/cancellation/acceptance
- FR-042: Events must be indexed for filtering (indexed parameters)

**IPFS / Metadata**
- FR-050: Pokémon images must be pinned on IPFS via Pinata
- FR-051: JSON metadata must be pinned on IPFS via Pinata
- FR-052: Metadata format must follow NFT standard (name, image, attributes)
- FR-053: Metadata must include: pokemonId, type, value, rarityTier, previousOwners

**Frontend**
- FR-060: User must be able to connect MetaMask wallet
- FR-061: User must be able to view the Pokémon catalog (151 Pokémon)
- FR-062: User must be able to view their card inventory
- FR-063: User must be able to create a trade offer
- FR-064: User must be able to view and accept open offers
- FR-065: User must be able to view transaction history

### NonFunctional Requirements

**Performance**
- NFR-001: Initial UI load time < 2s (First Contentful Paint)
- NFR-002: Contract read response time < 500ms (RPC latency)
- NFR-003: IPFS metadata fetch time < 3s
- NFR-004: Gas cost for mint < 200,000 units
- NFR-005: Gas cost for trade < 300,000 units

**Security**
- NFR-010: Contracts must be protected against reentrancy
- NFR-011: Critical functions must have appropriate access controls
- NFR-012: Private keys must never be exposed client-side
- NFR-013: Pinata JWT must be used server-side only (API route)
- NFR-014: User inputs must be validated before contract calls

**Reliability**
- NFR-020: Application must gracefully handle transaction errors
- NFR-021: Application must work even if an IPFS gateway is down (fallback)
- NFR-022: Pending transactions must be tracked and displayed

**Testability**
- NFR-030: Smart contract test coverage > 80%
- NFR-031: Tests for all happy paths for critical functions: 100%
- NFR-032: Tests for all revert conditions: 100%
- NFR-033: Frontend/contract integration tests: critical paths

**Maintainability**
- NFR-040: Solidity code must follow official style guide
- NFR-041: TypeScript code must pass ESLint without warnings
- NFR-042: Contracts must be documented with NatSpec
- NFR-043: Frontend must use strict TypeScript types

### Additional Requirements

**From Architecture (smart-contracts.md)**
- AR-001: Use ERC721 + ERC721URIStorage for unique card tokens
- AR-002: Use OpenZeppelin v5.x contracts (ERC721, Ownable, ReentrancyGuard)
- AR-003: Solidity version 0.8.20 with optimizer enabled (200 runs)
- AR-004: Custom errors for gas efficiency instead of revert strings
- AR-005: TradeMarket must be authorized by PokemonCards for transfers
- AR-006: Deploy order: PokemonCards first, then TradeMarket, then setTradeMarket()

**From Tech Stack (tech-stack.md)**
- AR-010: Frontend: Next.js 14 (App Router) + TypeScript 5.x
- AR-011: Ethereum interaction: wagmi 2.x + viem 2.x
- AR-012: UI components: shadcn/ui (Radix + Tailwind CSS)
- AR-013: State management: @tanstack/react-query 5.x (via wagmi)
- AR-014: Networks: Hardhat local (31337), Sepolia testnet (11155111)
- AR-015: IPFS: Pinata with gateway fallbacks (ipfs.io, cloudflare-ipfs.com)
- AR-016: RPC Provider: QuickNode for Sepolia

**From Product Brief**
- AR-020: Primary user: Developer/Student learning Web3
- AR-021: MVP success = all tests pass + constraints enforced + explainable
- AR-022: Onboarding target: clone to passing tests < 30 minutes
- AR-023: Educational focus over UI polish

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR-001 | Epic 2 | Mint tokens representing Pokémon cards |
| FR-002 | Epic 2 | Token has pokemonId (1-151) |
| FR-003 | Epic 2 | Token has rarityTier from stats |
| FR-004 | Epic 2 | Token has value (HP+ATK+DEF) |
| FR-005 | Epic 2 | Token points to IPFS metadata |
| FR-006 | Epic 2 | Timestamps stored on-chain |
| FR-010 | Epic 2 | Max 4 cards per wallet |
| FR-011 | Epic 2 | Mint rejected at 4-card limit |
| FR-012 | Epic 5 | Transfer rejected if recipient exceeds 4 |
| FR-020 | Epic 4 | 5-min cooldown between trade actions |
| FR-021 | Epic 4 | Cooldown applies to create/cancel/accept |
| FR-022 | Epic 2 | Mint NOT subject to cooldown |
| FR-023 | Epic 3 | Card locked 10 min after acquisition |
| FR-024 | Epic 3 | Locked card cannot be traded |
| FR-030 | Epic 4 | Create trade offer |
| FR-031 | Epic 4 | Offer status: Open/Cancelled/Accepted |
| FR-032 | Epic 4 | Only creator can cancel |
| FR-033 | Epic 5 | Atomic swap |
| FR-034 | Epic 5 | Verify maker owns card on accept |
| FR-035 | Epic 5 | Verify taker owns requested card |
| FR-040 | Epic 3 | On-chain previousOwners |
| FR-041 | Epic 6 | Events for mint/offer actions |
| FR-042 | Epic 6 | Indexed event parameters |
| FR-050 | Epic 2 | Pin images to IPFS |
| FR-051 | Epic 2 | Pin metadata JSON to IPFS |
| FR-052 | Epic 2 | NFT-standard metadata format |
| FR-053 | Epic 2 | Metadata includes all required fields |
| FR-060 | Epic 1 | Connect MetaMask wallet |
| FR-061 | Epic 2 | View Pokémon catalog |
| FR-062 | Epic 3 | View card inventory |
| FR-063 | Epic 4 | Create trade offer UI |
| FR-064 | Epic 5 | View and accept offers UI |
| FR-065 | Epic 6 | View transaction history |

**Coverage:** 33/33 FRs mapped (100%)

## Epic List

### Epic 1: Project Foundation & Wallet Connection
Users can connect their MetaMask wallet to the DApp and see network status, enabling all subsequent blockchain interactions. This epic includes initial project scaffolding (Next.js, Hardhat, smart contract deployment).

**FRs covered:** FR-060
**NFRs addressed:** NFR-012, NFR-020
**ARs addressed:** AR-005, AR-006, AR-010 to AR-016

---

### Epic 2: Pokémon Catalog & Card Minting
Users can browse the Gen 1 Pokémon catalog (151 Pokémon), view rarity and stats, and mint cards to their wallet with IPFS-stored metadata. The 4-card ownership limit is enforced on mint.

**FRs covered:** FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-010, FR-011, FR-022, FR-050, FR-051, FR-052, FR-053, FR-061
**NFRs addressed:** NFR-001, NFR-003, NFR-004, NFR-013, NFR-021

---

### Epic 3: Card Inventory & Details
Users can view their owned cards, see detailed information including stats, rarity, lock status (10-min lock after acquisition), and ownership history (previousOwners).

**FRs covered:** FR-023, FR-024, FR-040, FR-062
**NFRs addressed:** NFR-002, NFR-022

---

### Epic 4: Trade Marketplace - Creating & Managing Offers
Users can create trade offers for their unlocked cards, view their offers, and cancel them if needed. The 5-minute cooldown between trade actions is enforced.

**FRs covered:** FR-020, FR-021, FR-030, FR-031, FR-032, FR-063
**NFRs addressed:** NFR-010, NFR-011, NFR-014

---

### Epic 5: Trade Marketplace - Accepting Offers
Users can browse open offers, accept trades that match their cards, and complete atomic swaps. Ownership verification and 4-card limits are enforced on both parties.

**FRs covered:** FR-012, FR-033, FR-034, FR-035, FR-064
**NFRs addressed:** NFR-005, NFR-010

---

### Epic 6: Transaction History & Events
Users can view complete transaction history, filter by event type (mint, trade created, trade accepted, trade cancelled), and see the provenance trail of cards.

**FRs covered:** FR-041, FR-042, FR-065
**NFRs addressed:** NFR-022

---

### Epic 7: Testing, Documentation & Polish
Developers/students can run comprehensive tests (>80% coverage), understand the codebase via NatSpec and documentation, and demonstrate the project successfully for educational evaluation.

**FRs covered:** All FR validation via tests
**NFRs addressed:** NFR-030, NFR-031, NFR-032, NFR-033, NFR-040, NFR-041, NFR-042, NFR-043
**ARs addressed:** AR-020, AR-021, AR-022, AR-023

---

## Epic 1: Project Foundation & Wallet Connection

Users can connect their MetaMask wallet to the DApp and see network status, enabling all subsequent blockchain interactions.

### Story 1.1: Project Scaffolding & Smart Contract Deployment

As a **developer/student**,
I want **the project scaffolded with Next.js frontend and Hardhat-deployed smart contracts**,
So that **I have a working foundation to build the DApp upon**.

**Acceptance Criteria:**

**Given** the repository is cloned and dependencies installed
**When** I run `npx hardhat node` and the deploy script
**Then** PokemonCards and TradeMarket contracts are deployed to local network
**And** contract addresses are output for frontend configuration
**And** TradeMarket is authorized via `setTradeMarket()`

---

### Story 1.2: Wallet Connection UI

As a **user**,
I want **to connect my MetaMask wallet to the DApp**,
So that **I can interact with my cards and the marketplace**.

**Acceptance Criteria:**

**Given** I am on the home page without a connected wallet
**When** I click the "Connect Wallet" button
**Then** MetaMask opens and requests connection authorization
**And** after approval, my wallet address is displayed (truncated: `0x1234...abcd`)
**And** a "Disconnect" button replaces the "Connect Wallet" button

**Given** MetaMask is not installed
**When** I click the "Connect Wallet" button
**Then** I see an error message with a link to install MetaMask

---

### Story 1.3: Network Detection & Switching

As a **user**,
I want **to see which network I'm connected to and switch if needed**,
So that **I avoid transaction errors on the wrong network**.

**Acceptance Criteria:**

**Given** I am connected with my wallet
**When** I am on a supported network (Hardhat 31337 or Sepolia 11155111)
**Then** the network name is displayed (e.g., "Localhost" or "Sepolia")

**Given** I am connected to an unsupported network
**When** the page loads
**Then** I see a warning banner with a "Switch Network" button
**And** clicking the button triggers MetaMask network switch prompt

---

### Story 1.4: Wallet Disconnection

As a **connected user**,
I want **to disconnect my wallet**,
So that **I can secure my session or switch accounts**.

**Acceptance Criteria:**

**Given** I am connected with my wallet
**When** I click the "Disconnect" button
**Then** my session is terminated
**And** the UI returns to the non-connected state
**And** cached wallet data is cleared

---

## Epic 2: Pokémon Catalog & Card Minting

Users can browse the Gen 1 Pokémon catalog (151 Pokémon), view rarity and stats, and mint cards to their wallet with IPFS-stored metadata.

### Story 2.1: Pokémon Catalog Page

As a **user**,
I want **to browse the catalog of all 151 Gen 1 Pokémon**,
So that **I can choose which card I want to mint**.

**Acceptance Criteria:**

**Given** I am on the `/catalog` page
**When** the page loads
**Then** I see a grid of Pokémon cards from #1 to #151
**And** each card displays: image, name, type(s), and base stats (HP, Attack, Defense)
**And** a loading skeleton is shown while data fetches from PokeAPI
**And** pagination or infinite scroll handles the 151 entries

---

### Story 2.2: Rarity Calculation & Display

As a **user**,
I want **to see the rarity tier of each Pokémon**,
So that **I understand the value of cards before minting**.

**Acceptance Criteria:**

**Given** I am viewing a Pokémon in the catalog
**When** the card renders
**Then** the rarity tier is calculated from stats (HP + Attack + Defense)
**And** rarity is displayed with color coding:
  - COMMON (< 150): Gray
  - UNCOMMON (150-199): Green
  - RARE (200-249): Blue
  - LEGENDARY (≥ 250): Gold

---

### Story 2.3: IPFS Image & Metadata Pinning (API Routes)

As a **system**,
I want **to pin Pokémon images and metadata JSON to IPFS via Pinata**,
So that **card data is stored decentrally and referenced by tokenURI**.

**Acceptance Criteria:**

**Given** the frontend calls `/api/pin/image` with a Pokémon image URL
**When** the API route executes
**Then** the image is downloaded and pinned to Pinata
**And** an IPFS CID is returned (format: `ipfs://Qm...`)

**Given** the frontend calls `/api/pin/metadata` with card metadata
**When** the API route executes
**Then** the JSON is pinned to Pinata following NFT standard format
**And** metadata includes: name, description, image CID, attributes (type, HP, ATK, DEF, rarity, value)
**And** an IPFS CID is returned for tokenURI

---

### Story 2.4: Mint Card Transaction

As a **connected user**,
I want **to mint a Pokémon card to my wallet**,
So that **I own a tokenized card in my collection**.

**Acceptance Criteria:**

**Given** I am connected and have fewer than 4 cards
**When** I click "Mint" on a Pokémon card
**Then** the image and metadata are pinned to IPFS
**And** a MetaMask transaction prompt appears for `mint(pokemonId, rarityTier, value, tokenURI)`
**And** after confirmation, the card appears in my inventory
**And** a success toast notification is displayed

**Given** I already own 4 cards
**When** I try to mint
**Then** I see an error message "Maximum 4 cards reached"
**And** the Mint button is disabled

**Given** the transaction fails or is rejected
**When** the error occurs
**Then** I see a clear error message explaining what happened

---

### Story 2.5: Ownership Count Display

As a **user**,
I want **to see how many cards I currently own**,
So that **I know if I can mint more cards**.

**Acceptance Criteria:**

**Given** I am connected with my wallet
**When** I view the catalog page
**Then** I see my current card count displayed (e.g., "2/4 cards")
**And** the count updates after a successful mint

---

## Epic 3: Card Inventory & Details

Users can view their owned cards, see detailed information including stats, rarity, lock status, and ownership history.

### Story 3.1: Inventory Page

As a **connected user**,
I want **to view all my owned Pokémon cards**,
So that **I can manage my collection and decide which cards to trade**.

**Acceptance Criteria:**

**Given** I am connected and navigate to `/inventory`
**When** the page loads
**Then** I see a grid of all cards I own (0-4 cards)
**And** each card displays: image, name, type, rarity, and value
**And** the total count is shown (e.g., "3/4 cards")

**Given** I have no cards
**When** I view the inventory
**Then** I see an empty state message with a link to the catalog

---

### Story 3.2: Card Lock Status Display

As a **user**,
I want **to see if my cards are locked and when they unlock**,
So that **I know which cards I can trade**.

**Acceptance Criteria:**

**Given** I am viewing my inventory
**When** a card is locked (within 10 minutes of acquisition)
**Then** a lock icon is displayed on the card
**And** the remaining lock time is shown (e.g., "Unlocks in 5:32")
**And** the lock countdown updates in real-time

**Given** a card's lock period has expired
**When** I view the card
**Then** the lock icon is not shown
**And** the card displays as "Available for trade"

---

### Story 3.3: Card Detail Modal

As a **user**,
I want **to view detailed information about a specific card**,
So that **I can see its full stats and history**.

**Acceptance Criteria:**

**Given** I click on a card in my inventory
**When** the detail modal opens
**Then** I see: HD image, full stats (HP, Attack, Defense), type, rarity tier, calculated value
**And** timestamps are shown in readable format (Created, Last Transfer)
**And** lock status is displayed (locked until or "Available")
**And** a link to the IPFS metadata (CID) is provided

---

### Story 3.4: Previous Owners Display

As a **user**,
I want **to see the ownership history of my cards**,
So that **I can verify provenance and card authenticity**.

**Acceptance Criteria:**

**Given** I am viewing a card's detail modal
**When** the card has been traded before
**Then** I see a list of previous owners (addresses) in chronological order
**And** each address is displayed truncated (0x1234...abcd)

**Given** the card was minted by me and never traded
**When** I view the ownership history
**Then** I see "Original Owner" or an empty previous owners list

---

## Epic 4: Trade Marketplace - Creating & Managing Offers

Users can create trade offers for their unlocked cards, view their offers, and cancel them if needed.

### Story 4.1: Trade Page Layout

As a **user**,
I want **to access the trade marketplace**,
So that **I can create offers and view existing trades**.

**Acceptance Criteria:**

**Given** I navigate to `/trade`
**When** the page loads
**Then** I see sections for: "Create Offer", "My Offers", and "All Open Offers"
**And** the layout is clear and intuitive

---

### Story 4.2: Create Trade Offer Form

As a **connected user with unlocked cards**,
I want **to create a trade offer specifying my card and the card I want**,
So that **other users can see and accept my offer**.

**Acceptance Criteria:**

**Given** I am on the trade page with at least one unlocked card
**When** I select my card to offer and the card I want (by tokenId or search)
**Then** I can preview the offer details
**And** clicking "Create Offer" triggers a MetaMask transaction for `createOffer(makerTokenId, takerTokenId)`

**Given** my selected card is locked
**When** I try to create an offer
**Then** I see an error "Card is locked" with remaining lock time
**And** the Create button is disabled

**Given** I am in cooldown (within 5 min of last trade action)
**When** I try to create an offer
**Then** I see an error "Cooldown active" with remaining time
**And** the Create button is disabled

---

### Story 4.3: Cooldown Timer Display

As a **user**,
I want **to see my remaining cooldown time**,
So that **I know when I can perform my next trade action**.

**Acceptance Criteria:**

**Given** I am on the trade page
**When** I have an active cooldown
**Then** I see a countdown timer (e.g., "Next action in 3:45")
**And** the timer updates in real-time

**Given** my cooldown has expired
**When** I view the trade page
**Then** no cooldown message is shown
**And** trade actions are enabled

---

### Story 4.4: My Offers List

As a **user**,
I want **to see all trade offers I have created**,
So that **I can track and manage my pending trades**.

**Acceptance Criteria:**

**Given** I am on the trade page
**When** I view the "My Offers" section
**Then** I see a list of my offers with: my card, requested card, status (Open/Cancelled/Accepted), created date

**Given** I have no offers
**When** I view "My Offers"
**Then** I see an empty state message

---

### Story 4.5: Cancel Trade Offer

As a **user who created an offer**,
I want **to cancel my open offer**,
So that **I can retract my trade proposal if I change my mind**.

**Acceptance Criteria:**

**Given** I have an Open offer
**When** I click "Cancel" on that offer
**Then** a MetaMask transaction is triggered for `cancelOffer(offerId)`
**And** after confirmation, the offer status changes to "Cancelled"

**Given** my offer is already Cancelled or Accepted
**When** I view the offer
**Then** the Cancel button is not shown

**Given** I am in cooldown
**When** I try to cancel
**Then** I see "Cooldown active" error with remaining time

---

## Epic 5: Trade Marketplace - Accepting Offers

Users can browse open offers, accept trades that match their cards, and complete atomic swaps.

### Story 5.1: Browse All Open Offers

As a **user**,
I want **to browse all open trade offers**,
So that **I can find trades that match cards I own**.

**Acceptance Criteria:**

**Given** I am on the trade page
**When** I view the "All Open Offers" section
**Then** I see a list of all offers with status "Open"
**And** each offer shows: maker's card (image, name, rarity), requested card (image, name, rarity), maker address

**Given** I own the requested card in an offer
**When** I view that offer
**Then** the offer is highlighted or marked as "You can accept this"
**And** an "Accept" button is visible

---

### Story 5.2: Accept Trade Offer

As a **user who owns the requested card**,
I want **to accept an open trade offer**,
So that **I can complete an atomic swap and acquire the offered card**.

**Acceptance Criteria:**

**Given** I own the requested card and it is unlocked
**When** I click "Accept" on an open offer
**Then** a MetaMask transaction is triggered for `acceptOffer(offerId)`
**And** after confirmation, both cards are swapped atomically
**And** the offer status changes to "Accepted"
**And** a success notification is displayed

**Given** my card is locked
**When** I try to accept
**Then** I see an error "Your card is locked" with remaining time

**Given** the maker's card is locked
**When** I try to accept
**Then** I see an error "Maker's card is locked"

**Given** the maker no longer owns their card
**When** I try to accept
**Then** I see an error "Maker no longer owns this card"

---

### Story 5.3: Post-Trade Lock & Cooldown Application

As a **system**,
I want **to apply lock and cooldown after a successful trade**,
So that **anti-exploitation rules are enforced**.

**Acceptance Criteria:**

**Given** a trade is successfully completed
**When** the transaction confirms
**Then** both traded cards are locked for 10 minutes
**And** both the maker and taker have their cooldown reset (5 min)
**And** the UI reflects the new lock status on both cards

---

### Story 5.4: Ownership Limit Enforcement on Accept

As a **system**,
I want **to verify 4-card limits before completing a trade**,
So that **neither party exceeds the maximum cards**.

**Acceptance Criteria:**

**Given** accepting a trade would cause the taker to exceed 4 cards
**When** the accept transaction is attempted
**Then** the transaction reverts with "MaxCardsReached"
**And** the UI displays an appropriate error message

**Given** accepting a trade would cause the maker to exceed 4 cards (edge case with simultaneous actions)
**When** the accept transaction is attempted
**Then** the transaction reverts with "MaxCardsReached"

---

## Epic 6: Transaction History & Events

Users can view complete transaction history, filter by event type, and see the provenance trail of cards.

### Story 6.1: History Page Layout

As a **user**,
I want **to access a transaction history page**,
So that **I can view all blockchain events related to my activity**.

**Acceptance Criteria:**

**Given** I navigate to `/history`
**When** the page loads
**Then** I see a list of events in reverse chronological order (newest first)
**And** the page layout supports filtering and searching

---

### Story 6.2: Display Mint Events

As a **user**,
I want **to see when cards were minted**,
So that **I can track card creation history**.

**Acceptance Criteria:**

**Given** I am on the history page
**When** a CardMinted event exists
**Then** I see: event type "Mint", owner address, tokenId, pokemonId, rarityTier, timestamp
**And** the event is linked to the card's detail view

---

### Story 6.3: Display Trade Events

As a **user**,
I want **to see trade offer events (created, accepted, cancelled)**,
So that **I can track marketplace activity**.

**Acceptance Criteria:**

**Given** I am on the history page
**When** TradeCreated events exist
**Then** I see: event type "Offer Created", maker, makerTokenId, takerTokenId, timestamp

**Given** TradeAccepted events exist
**When** I view the history
**Then** I see: event type "Trade Completed", taker, maker, offerId, timestamp

**Given** TradeCancelled events exist
**When** I view the history
**Then** I see: event type "Offer Cancelled", offerId, timestamp

---

### Story 6.4: Event Filtering

As a **user**,
I want **to filter events by type**,
So that **I can focus on specific activity**.

**Acceptance Criteria:**

**Given** I am on the history page
**When** I select a filter (e.g., "Mints only", "Trades only", "My activity")
**Then** only matching events are displayed
**And** the filter selection is visually indicated

**Given** I filter by "My activity"
**When** events are filtered
**Then** I see only events where I am the owner, maker, or taker

---

### Story 6.5: Transaction Links

As a **user**,
I want **to view transaction details on a block explorer**,
So that **I can verify events on-chain**.

**Acceptance Criteria:**

**Given** I am viewing an event in history
**When** I click on the transaction hash
**Then** I am directed to the block explorer (Etherscan for Sepolia, or local explorer for Hardhat)
**And** the link opens in a new tab

---

## Epic 7: Testing, Documentation & Polish

Developers/students can run comprehensive tests, understand the codebase, and demonstrate the project successfully.

### Story 7.1: PokemonCards Contract Unit Tests

As a **developer/student**,
I want **comprehensive unit tests for the PokemonCards contract**,
So that **I can verify all minting and ownership rules work correctly**.

**Acceptance Criteria:**

**Given** I run `npx hardhat test`
**When** PokemonCards tests execute
**Then** tests cover: successful mint, mint at limit (4 cards), mint rejection at limit
**And** tests cover: invalid pokemonId rejection (0, 152)
**And** tests cover: lock period after mint (10 min)
**And** tests cover: previousOwners tracking on transfer
**And** all tests pass with >80% coverage for PokemonCards.sol

---

### Story 7.2: TradeMarket Contract Unit Tests

As a **developer/student**,
I want **comprehensive unit tests for the TradeMarket contract**,
So that **I can verify all trading rules work correctly**.

**Acceptance Criteria:**

**Given** I run `npx hardhat test`
**When** TradeMarket tests execute
**Then** tests cover: successful offer creation, cancellation, acceptance
**And** tests cover: cooldown enforcement (5 min between actions)
**And** tests cover: card lock enforcement (cannot trade locked cards)
**And** tests cover: ownership verification on accept
**And** tests cover: atomic swap execution
**And** all tests pass with >80% coverage for TradeMarket.sol

---

### Story 7.3: Revert Condition Tests

As a **developer/student**,
I want **tests for all revert conditions**,
So that **I can demonstrate error handling works correctly**.

**Acceptance Criteria:**

**Given** I run the test suite
**When** revert tests execute
**Then** tests verify: MaxCardsReached revert
**And** tests verify: InvalidPokemonId revert
**And** tests verify: CardLocked revert
**And** tests verify: CooldownActive revert
**And** tests verify: NotOwner revert
**And** tests verify: OfferNotOpen revert
**And** each revert includes the correct custom error

---

### Story 7.4: NatSpec Documentation

As a **developer/student**,
I want **NatSpec comments on all public contract functions**,
So that **the codebase is self-documenting and explainable**.

**Acceptance Criteria:**

**Given** I review the smart contracts
**When** I examine public functions
**Then** each function has `@notice` describing its purpose
**And** each function has `@param` for all parameters
**And** each function has `@return` for return values
**And** each function has `@dev` for implementation notes where needed

---

### Story 7.5: Code Quality & Linting

As a **developer/student**,
I want **the codebase to pass all linting rules**,
So that **the code follows best practices and is maintainable**.

**Acceptance Criteria:**

**Given** I run linting commands
**When** Solidity linting executes (`npx solhint`)
**Then** no errors or warnings are reported

**Given** I run TypeScript linting
**When** ESLint executes (`npm run lint`)
**Then** no errors or warnings are reported
**And** all TypeScript files use strict types (no `any`)

---

### Story 7.6: README & Onboarding Documentation

As a **developer/student**,
I want **clear README documentation**,
So that **I can onboard in under 30 minutes**.

**Acceptance Criteria:**

**Given** I read the README
**When** I follow the setup instructions
**Then** I can complete: clone, install, deploy, test in < 30 minutes
**And** the README explains: project purpose, tech stack, setup steps, available commands
**And** the README links to detailed documentation for each component
