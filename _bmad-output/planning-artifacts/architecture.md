---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2026-01-14'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-5BLOCK-2026-01-14.md
  - _bmad-output/planning-artifacts/epics.md
  - docs/specs/technical-requirements.md
  - docs/specs/smart-contracts.md
  - docs/specs/tech-stack.md
  - docs/user-stories.md
workflowType: 'architecture'
project_name: '5BLOCK'
user_name: 'Naiki'
date: '2026-01-14'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The PRD defines 33 functional requirements across 7 domains:

1. **Token Management (FR-001 to FR-006)**: ERC-721 minting with on-chain CardMeta struct storing pokemonId, rarityTier, value, timestamps, and lockUntil
2. **Ownership Constraints (FR-010 to FR-012)**: Hard 4-card limit per wallet, enforced on mint AND transfer
3. **Temporal Constraints (FR-020 to FR-024)**: 5-minute wallet cooldown for trade actions, 10-minute card lock after acquisition
4. **Trade Marketplace (FR-030 to FR-035)**: Offer/accept pattern with atomic swap, status tracking (Open/Cancelled/Accepted)
5. **Traceability (FR-040 to FR-042)**: On-chain previousOwners array, indexed events for CardMinted, TradeCreated, TradeAccepted, TradeCancelled
6. **IPFS/Metadata (FR-050 to FR-053)**: Pinata pinning for images and JSON metadata, NFT-standard format
7. **Frontend (FR-060 to FR-065)**: MetaMask connection, catalog browse, inventory view, trade creation/acceptance, history display

**Non-Functional Requirements:**

| Category | Key Requirements |
|----------|------------------|
| Performance | Gas < 200k mint, < 300k trade, UI load < 2s, IPFS fetch < 3s |
| Security | ReentrancyGuard, access controls, server-side Pinata JWT |
| Testability | >80% contract coverage, 100% revert condition tests |
| Maintainability | NatSpec documentation, strict TypeScript, ESLint compliance |

**Scale & Complexity:**

- Primary domain: **Blockchain/Web3 Full-Stack DApp**
- Complexity level: **Medium-High** (two-contract system with time-based state machine)
- Estimated architectural components: **15-20** (2 contracts, 5 routes, 2 API routes, 10+ hooks)

### Technical Constraints & Dependencies

**Smart Contract Constraints:**
- Solidity 0.8.20 with optimizer (200 runs)
- OpenZeppelin v5.x (ERC721, ERC721URIStorage, Ownable, ReentrancyGuard)
- Deploy order: PokemonCards → TradeMarket → setTradeMarket()
- TradeMarket requires approval to transfer cards on behalf of users

**Frontend Constraints:**
- Next.js 14 App Router (client-side rendering for Web3)
- wagmi 2.x + viem 2.x (TypeScript-first Ethereum interaction)
- shadcn/ui (Radix + Tailwind) for consistent UI components
- MetaMask-only wallet support (no WalletConnect in MVP)

**External Dependencies:**
- PokeAPI: 100 req/min rate limit, Gen 1 data (151 Pokémon)
- Pinata: 500 pins, 1GB storage (free tier), JWT authentication
- QuickNode: Ethereum RPC for Sepolia testnet

**Network Constraints:**
- Primary: Hardhat local (chainId 31337)
- Secondary: Sepolia testnet (chainId 11155111)
- Mainnet: Explicitly excluded

### Cross-Cutting Concerns Identified

1. **State Synchronization**
   - Contract events must invalidate React Query cache
   - Optimistic updates for pending transactions
   - Real-time cooldown/lock timer updates across components

2. **Error Handling Pipeline**
   - Custom Solidity errors → viem parsing → user-friendly messages
   - Map error codes: MaxCardsReached, CardLocked, CooldownActive, NotOwner, OfferNotOpen

3. **Time-Based State Machine**
   - Cooldown tracking per wallet (5 minutes)
   - Lock tracking per card (10 minutes)
   - Real-time countdown UI components
   - Hardhat time helpers for deterministic testing

4. **IPFS Resilience Strategy**
   - Gateway fallback chain: Pinata → ipfs.io → cloudflare-ipfs.com
   - Client-side metadata caching
   - Retry logic with exponential backoff

5. **Wallet State Management**
   - Connection persistence across page navigation
   - Network mismatch detection and switch prompts
   - Account change handling (clear cache, refresh state)

6. **Educational Documentation**
   - NatSpec on all public contract functions
   - Test comments explaining business rule being validated
   - README enabling < 30 minute onboarding

## Starter Template Evaluation

### Primary Technology Domain

**Full-Stack Web3 DApp (Ethereum)** - combining Next.js frontend with Solidity smart contracts and IPFS storage.

### Starter Options Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Scaffold-ETH 2** | Complete dApp stack, hot reload, built-in block explorer | Includes RainbowKit (not MetaMask-only), opinionated structure | Rejected |
| **create-next-app + Hardhat** | Exact match to tech stack, maximum flexibility | Requires manual integration | **Selected** |
| **next-wagmi-template** | Quick wagmi setup | Includes Web3Modal, less maintained | Rejected |

### Selected Approach: Dual Initialization

**Rationale:**
- Matches exact tech stack from specifications (no extra dependencies)
- Clean separation between frontend and contracts
- Follows educational principle: students understand each piece
- MetaMask-only requirement excludes RainbowKit/Web3Modal starters

### Initialization Commands

**Frontend (Next.js 14 + TypeScript + Tailwind + App Router):**
```bash
pnpm create next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
cd frontend
pnpm dlx shadcn@latest init
pnpm add wagmi viem @tanstack/react-query
```

**Smart Contracts (Hardhat + TypeScript):**
```bash
mkdir contracts && cd contracts
pnpm init -y
pnpm add -D hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts typescript ts-node @types/node
npx hardhat init  # Select: TypeScript project
```

### Architectural Decisions Provided by Starters

**Language & Runtime:**
- TypeScript 5.x with strict mode
- Node.js >= 18.17 (Next.js requirement)
- Solidity 0.8.20 with optimizer (200 runs)

**Styling Solution:**
- Tailwind CSS 3.x (via create-next-app)
- shadcn/ui components (manual addition)
- CSS variables for theming

**Build Tooling:**
- Next.js built-in bundler (Turbopack in dev)
- Hardhat compilation and deployment
- pnpm for dependency management

**Testing Framework:**
- Hardhat Toolbox (Chai + Mocha)
- @nomicfoundation/hardhat-network-helpers for time manipulation
- Frontend: manual setup if needed (Vitest recommended)

**Code Organization:**
```
5block/
├── frontend/           # Next.js App Router
│   ├── src/
│   │   ├── app/        # Routes
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom hooks (wagmi wrappers)
│   │   ├── lib/        # Utilities, contract configs
│   │   └── types/      # TypeScript types
│   └── public/
├── contracts/          # Hardhat project
│   ├── contracts/      # Solidity sources
│   ├── test/           # Contract tests
│   ├── scripts/        # Deploy scripts
│   └── hardhat.config.ts
└── docs/               # Existing documentation
```

**Development Experience:**
- Hot reloading in Next.js dev server
- Hardhat local network with instant transactions
- TypeScript autocompletion for contract ABIs
- ESLint + Prettier for consistent formatting

**Note:** Project initialization should be the first implementation story in Epic 1.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Contract state reading strategy
- Pinata API protection pattern
- Contract address management
- Development workflow orchestration

**Important Decisions (Shape Architecture):**
- Component organization pattern
- Error handling approach
- Caching strategy

**Deferred Decisions (Post-MVP):**
- Event indexing/The Graph integration
- Advanced caching (Redis, localStorage)
- CI/CD pipeline configuration

### Data Architecture

**Contract State Reading:** Direct RPC with React Query caching
- Use wagmi's `useReadContract` for individual queries
- React Query provides automatic caching, refetching, and stale management
- Rationale: Educational simplicity, low volume (max 4 cards/user)

**Metadata Caching:** React Query with infinite staleTime
- IPFS metadata is immutable - cache indefinitely in memory
- Configuration: `staleTime: Infinity` for metadata queries
- Rationale: Reduces gateway calls, metadata never changes

### Authentication & Security

**Wallet Connection:** Conditional auto-reconnect (wagmi default)
- wagmi persists connection state to localStorage
- Auto-reconnects if user previously connected
- Manual "Connect" button for first-time users

**Pinata API Protection:** Next.js API Routes
- Routes: `/api/pin/image`, `/api/pin/metadata`
- JWT stored in server-side environment variables only
- Rationale: Matches tech stack, co-located with frontend

### API & Communication Patterns

**Contract Interaction:** wagmi hooks wrapping viem actions
- Read operations: `useReadContract` with React Query
- Write operations: `useWriteContract` + `useWaitForTransactionReceipt`
- Events: `useWatchContractEvent` for real-time updates

**Error Handling:** Inline mapping in mutation hooks
- Each write hook handles its own error parsing
- Custom errors extracted via viem's `decodeErrorResult`
- User-friendly messages returned alongside error codes

### Frontend Architecture

**Component Organization:** Flat structure with semantic prefixes
```
src/components/
├── WalletConnect.tsx
├── WalletStatus.tsx
├── PokemonCard.tsx
├── PokemonGrid.tsx
├── CardDetail.tsx
├── TradeOfferCard.tsx
├── TradeOfferForm.tsx
├── CooldownTimer.tsx
├── LockIndicator.tsx
└── ui/                 # shadcn primitives
    ├── button.tsx
    ├── card.tsx
    └── ...
```
Rationale: Simple, searchable, educational clarity

**Hooks Organization:** By data source
```
src/hooks/
├── pokemon/
│   ├── usePokemonList.ts
│   └── usePokemon.ts
├── contracts/
│   ├── useOwnedCards.ts
│   ├── useCardMeta.ts
│   ├── useMintCard.ts
│   ├── useOpenOffers.ts
│   ├── useCreateOffer.ts
│   ├── useAcceptOffer.ts
│   ├── useCancelOffer.ts
│   └── useCooldownRemaining.ts
└── ipfs/
    ├── usePinImage.ts
    ├── usePinMetadata.ts
    └── useFetchMetadata.ts
```
Rationale: Clear separation by data source, easier to navigate

### Infrastructure & Deployment

**Development Workflow:** Docker Compose orchestration
```yaml
# docker-compose.yml
services:
  hardhat:
    build: ./contracts
    ports:
      - "8545:8545"
    command: npx hardhat node

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_CHAIN_ID=31337
    depends_on:
      - hardhat
```
Rationale: Reproducible environment, single `docker-compose up` command

**Contract Address Management:** TypeScript config with network mapping
```typescript
// src/lib/contracts/addresses.ts
export const CONTRACT_ADDRESSES = {
  31337: { // Hardhat local
    pokemonCards: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    tradeMarket: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  },
  11155111: { // Sepolia
    pokemonCards: "0x...",
    tradeMarket: "0x...",
  },
} as const;

export function getAddresses(chainId: number) {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!addresses) throw new Error(`Unsupported chain: ${chainId}`);
  return addresses;
}
```
Rationale: Type-safe, network-aware, easy to update after deployment

### Decision Impact Analysis

**Implementation Sequence:**
1. Docker Compose setup (enables consistent dev environment)
2. Contract deployment scripts (outputs addresses)
3. Address config file (connects frontend to contracts)
4. wagmi config with network-aware addresses
5. API routes for Pinata (enables minting)
6. Hooks by data source (organized development)

**Cross-Component Dependencies:**
- Docker Compose → Hardhat node must be running before frontend
- Deploy script → Must update address config after each deployment
- Address config → All contract hooks depend on this
- API routes → Mint flow depends on Pinata routes

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**8 Critical Conflict Points Identified** where AI agents could make different choices that would cause integration issues.

### Naming Patterns

**Solidity Naming Conventions:**
- Variables: `camelCase` → `cardMeta`, `lockUntil`, `previousOwners`
- Constants: `UPPER_SNAKE_CASE` → `MAX_CARDS_PER_WALLET`, `LOCK_DURATION`
- Functions: `camelCase` → `getCardMeta()`, `createOffer()`
- Events: `PascalCase` → `CardMinted`, `TradeAccepted`
- Errors: `PascalCase` → `MaxCardsReached`, `CardLocked`

**Custom Hook Naming:**
- Pattern: `use` + `Action` + `Target`
- Read hooks: `useOwnedCards`, `useCardMeta`, `useOpenOffers`, `useCooldownRemaining`
- Write hooks: `useMintCard`, `useCreateOffer`, `useAcceptOffer`, `useCancelOffer`
- External data: `usePokemonList`, `usePokemon`, `useFetchMetadata`
- IPFS operations: `usePinImage`, `usePinMetadata`

**Component & File Naming:**
- Components: `PascalCase` → `PokemonCard.tsx`, `TradeOfferForm.tsx`
- Props interfaces: `{ComponentName}Props` → `PokemonCardProps`, `TradeOfferFormProps`
- Hooks: `camelCase` with `use` prefix → `useOwnedCards.ts`
- Utilities: `camelCase` → `calculateRarity.ts`, `formatAddress.ts`
- Types: `PascalCase` → `CardMeta`, `TradeOffer`, `RarityTier`

### Type Patterns

**Contract Data Types:**
- Define manual interfaces in `src/types/contracts.ts`
- Keep `bigint` for tokenIds and timestamps throughout the app
- Only convert to display format at render time

```typescript
// src/types/contracts.ts
export interface CardMeta {
  tokenId: bigint;
  pokemonId: number;
  rarityTier: RarityTier;
  value: number;
  createdAt: bigint;
  lastTransferAt: bigint;
  lockUntil: bigint;
}

export interface TradeOffer {
  offerId: bigint;
  maker: `0x${string}`;
  makerTokenId: bigint;
  takerTokenId: bigint;
  status: OfferStatus;
  createdAt: bigint;
}

export type RarityTier = 1 | 2 | 3 | 4;
export type OfferStatus = 'Open' | 'Cancelled' | 'Accepted';
```

**BigInt Handling:**
- Pass as `bigint` between components and hooks
- Format for display using utility: `formatTokenId(tokenId: bigint): string`
- Never convert to `number` (overflow risk)

### Structure Patterns

**API Route Organization:**
```
src/app/api/
├── ipfs/
│   ├── image/
│   │   └── route.ts      # POST - pin image to IPFS
│   └── metadata/
│       └── route.ts      # POST - pin metadata JSON to IPFS
```

**Test File Location:**
- Frontend: Co-located with source (`useOwnedCards.test.ts` next to `useOwnedCards.ts`)
- Contracts: Hardhat convention (`contracts/test/*.ts`)

### Format Patterns

**API Response Format:**
```typescript
// Success response
{ success: true, data: { cid: "Qm..." } }

// Error response
{ success: false, error: { code: "PINATA_ERROR", message: "..." } }
```

**Error Message Format (Toast-ready):**
```typescript
interface ToastError {
  title: string;      // Short title for toast header
  description: string; // Detailed explanation
  code?: string;      // Machine-readable code for debugging
}

// Example
{
  title: "Card Locked",
  description: "This card cannot be traded for another 8 minutes.",
  code: "CardLocked"
}
```

**Contract Error Mapping:**
```typescript
// src/lib/errors.ts
export const CONTRACT_ERRORS: Record<string, ToastError> = {
  MaxCardsReached: {
    title: "Wallet Full",
    description: "You already have 4 cards. Trade or transfer one before minting.",
  },
  CardLocked: {
    title: "Card Locked",
    description: "This card was recently acquired and cannot be traded yet.",
  },
  CooldownActive: {
    title: "Cooldown Active",
    description: "Please wait before performing another trade action.",
  },
  NotOwner: {
    title: "Not Your Card",
    description: "You don't own this card.",
  },
  OfferNotOpen: {
    title: "Offer Unavailable",
    description: "This trade offer is no longer available.",
  },
};
```

### Communication Patterns

**Event Watching Pattern:**
```typescript
// Watch for CardMinted events to invalidate cache
useWatchContractEvent({
  address: addresses.pokemonCards,
  abi: pokemonCardsAbi,
  eventName: 'CardMinted',
  onLogs: () => {
    queryClient.invalidateQueries({ queryKey: ['ownedCards'] });
  },
});
```

**State Invalidation Pattern:**
- After successful write: invalidate related queries
- Use React Query's `invalidateQueries` with consistent query keys
- Query key format: `['resource', ...params]` → `['ownedCards', address]`, `['cardMeta', tokenId]`

### Process Patterns

**Loading State Pattern:**
- Use wagmi's built-in states: `isPending`, `isConfirming`, `isConfirmed`
- Three-stage transaction flow:
  1. `isPending`: Waiting for wallet signature
  2. `isConfirming`: Transaction submitted, awaiting confirmation
  3. `isConfirmed`: Transaction confirmed on-chain

**Error Handling Pattern:**
```typescript
// In mutation hooks
try {
  const hash = await writeContractAsync({ ... });
  // Success flow
} catch (error) {
  const parsed = parseContractError(error);
  toast({
    variant: "destructive",
    ...CONTRACT_ERRORS[parsed.code] ?? {
      title: "Transaction Failed",
      description: parsed.message,
    }
  });
}
```

### Enforcement Guidelines

**All AI Agents MUST:**
1. Use exact naming conventions defined above (camelCase for vars, PascalCase for components)
2. Keep `bigint` types for all blockchain values - never convert to `number`
3. Use Toast-ready error format for all user-facing errors
4. Follow query key convention: `['resource', ...params]`
5. Organize hooks by data source (pokemon/, contracts/, ipfs/)
6. Co-locate frontend tests with source files

**Pattern Verification:**
- ESLint rules enforce naming conventions
- TypeScript strict mode catches type mismatches
- PR review checks pattern compliance

### Pattern Examples

**Good Examples:**
```typescript
// ✅ Correct hook naming
export function useMintCard() { ... }
export function useOwnedCards(address: `0x${string}`) { ... }

// ✅ Correct type usage
const tokenId: bigint = cardMeta.tokenId;
const displayId = formatTokenId(tokenId); // Only for display

// ✅ Correct error handling
toast({ ...CONTRACT_ERRORS[errorCode] });

// ✅ Correct query key
useQuery({ queryKey: ['ownedCards', address], ... });
```

**Anti-Patterns:**
```typescript
// ❌ Wrong hook naming
export function useGetCards() { ... }  // Should be useOwnedCards
export function cardMint() { ... }      // Should be useMintCard

// ❌ Wrong type handling
const tokenId: number = Number(cardMeta.tokenId); // Overflow risk!

// ❌ Wrong error format
alert("Error: " + error.message);  // Should use toast with structured error

// ❌ Inconsistent query keys
useQuery({ queryKey: ['cards'], ... });  // Should be ['ownedCards', address]
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
5block/
├── README.md                           # Project overview, setup instructions
├── docker-compose.yml                  # Orchestrates hardhat + frontend
├── .gitignore
├── .env.example                        # Template for environment variables
│
├── contracts/                          # Hardhat project (Smart Contracts)
│   ├── package.json
│   ├── hardhat.config.ts
│   ├── tsconfig.json
│   ├── .env                            # PRIVATE_KEY, QUICKNODE_URL, ETHERSCAN_KEY
│   ├── .env.example
│   ├── Dockerfile                      # For docker-compose hardhat service
│   │
│   ├── contracts/                      # Solidity sources
│   │   ├── PokemonCards.sol            # ERC-721 NFT contract (FR-001 to FR-012)
│   │   └── TradeMarket.sol             # Marketplace contract (FR-030 to FR-035)
│   │
│   ├── test/                           # Contract tests (>80% coverage)
│   │   ├── PokemonCards.test.ts        # Token + ownership tests
│   │   ├── TradeMarket.test.ts         # Trade flow tests
│   │   ├── Cooldown.test.ts            # FR-020 to FR-024 time tests
│   │   └── Integration.test.ts         # Cross-contract scenarios
│   │
│   └── scripts/
│       ├── deploy.ts                   # Deployment script (outputs addresses)
│       └── seed.ts                     # Optional: mint test cards
│
├── frontend/                           # Next.js 14 App Router
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── postcss.config.js
│   ├── components.json                 # shadcn/ui config
│   ├── Dockerfile                      # For docker-compose frontend service
│   ├── .env.local                      # PINATA_JWT, NEXT_PUBLIC_* vars
│   ├── .env.example
│   │
│   ├── public/
│   │   └── favicon.ico
│   │
│   └── src/
│       ├── app/                        # App Router pages (FR-060 to FR-065)
│       │   ├── globals.css
│       │   ├── layout.tsx              # Root layout with providers
│       │   ├── page.tsx                # Home + wallet connect
│       │   ├── providers.tsx           # wagmi + QueryClient providers
│       │   │
│       │   ├── catalog/
│       │   │   └── page.tsx            # Browse & mint Pokémon (FR-060)
│       │   │
│       │   ├── inventory/
│       │   │   └── page.tsx            # View owned cards (FR-061)
│       │   │
│       │   ├── trade/
│       │   │   └── page.tsx            # Create/accept trades (FR-062, FR-063)
│       │   │
│       │   ├── history/
│       │   │   └── page.tsx            # Transaction events (FR-065)
│       │   │
│       │   └── api/                    # API Routes (server-side)
│       │       └── ipfs/
│       │           ├── image/
│       │           │   └── route.ts    # POST: pin image to Pinata
│       │           └── metadata/
│       │               └── route.ts    # POST: pin metadata JSON
│       │
│       ├── components/                 # React components
│       │   ├── WalletConnect.tsx       # Connect button + status
│       │   ├── WalletStatus.tsx        # Address display, network badge
│       │   ├── NetworkSwitcher.tsx     # Network mismatch handler
│       │   ├── PokemonCard.tsx         # Single card display
│       │   ├── PokemonGrid.tsx         # Grid of cards (catalog/inventory)
│       │   ├── CardDetail.tsx          # Full card info modal
│       │   ├── MintButton.tsx          # Mint action with loading states
│       │   ├── TradeOfferCard.tsx      # Single trade offer display
│       │   ├── TradeOfferForm.tsx      # Create trade form
│       │   ├── CooldownTimer.tsx       # Real-time countdown display
│       │   ├── LockIndicator.tsx       # Card lock status badge
│       │   ├── HistoryList.tsx         # Event history list
│       │   └── ui/                     # shadcn/ui primitives
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── dialog.tsx
│       │       ├── badge.tsx
│       │       ├── skeleton.tsx
│       │       ├── toast.tsx
│       │       ├── toaster.tsx
│       │       └── ...
│       │
│       ├── hooks/                      # Custom hooks (by data source)
│       │   ├── pokemon/                # PokeAPI hooks
│       │   │   ├── usePokemonList.ts   # Fetch all 151 Pokémon
│       │   │   ├── usePokemon.ts       # Fetch single Pokémon
│       │   │   └── usePokemonList.test.ts
│       │   │
│       │   ├── contracts/              # Contract interaction hooks
│       │   │   ├── useOwnedCards.ts    # Get cards by owner
│       │   │   ├── useCardMeta.ts      # Get card metadata
│       │   │   ├── useMintCard.ts      # Mint new card
│       │   │   ├── useOpenOffers.ts    # Get open trade offers
│       │   │   ├── useCreateOffer.ts   # Create trade offer
│       │   │   ├── useAcceptOffer.ts   # Accept trade offer
│       │   │   ├── useCancelOffer.ts   # Cancel trade offer
│       │   │   ├── useCooldownRemaining.ts  # Get cooldown status
│       │   │   ├── useContractEvents.ts     # Watch contract events
│       │   │   └── *.test.ts           # Co-located tests
│       │   │
│       │   └── ipfs/                   # IPFS hooks
│       │       ├── usePinImage.ts      # Pin image via API route
│       │       ├── usePinMetadata.ts   # Pin metadata via API route
│       │       ├── useFetchMetadata.ts # Fetch from IPFS gateway
│       │       └── *.test.ts
│       │
│       ├── lib/                        # Utilities and configs
│       │   ├── contracts/
│       │   │   ├── addresses.ts        # Network → address mapping
│       │   │   ├── abis/
│       │   │   │   ├── PokemonCards.json
│       │   │   │   └── TradeMarket.json
│       │   │   └── config.ts           # wagmi contract configs
│       │   │
│       │   ├── errors.ts               # CONTRACT_ERRORS mapping
│       │   ├── rarity.ts               # calculateRarity(), RARITY_TIERS
│       │   ├── format.ts               # formatAddress(), formatTokenId()
│       │   ├── ipfs.ts                 # IPFS gateway utilities
│       │   ├── pokeapi.ts              # PokeAPI client
│       │   └── utils.ts                # General utilities
│       │
│       └── types/                      # TypeScript types
│           ├── contracts.ts            # CardMeta, TradeOffer, etc.
│           ├── pokemon.ts              # PokemonTemplate, PokeAPIResponse
│           └── index.ts                # Re-exports
│
└── docs/                               # Existing documentation
    ├── specs/
    │   ├── technical-requirements.md
    │   ├── smart-contracts.md
    │   └── tech-stack.md
    └── user-stories/
        └── *.md
```

### Architectural Boundaries

**Smart Contract Boundaries:**
```
┌─────────────────────────────────────────────────────────────┐
│                    PokemonCards.sol                          │
│  - ERC-721 token management                                  │
│  - CardMeta storage                                          │
│  - Ownership limits (max 4)                                  │
│  - Lock mechanism (10 min)                                   │
│  - previousOwners tracking                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ setTradeMarket()
                              │ transferFrom()
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    TradeMarket.sol                           │
│  - Offer CRUD (create/cancel/accept)                         │
│  - Cooldown enforcement (5 min)                              │
│  - Atomic swap execution                                     │
│  - Event emission for trades                                 │
└─────────────────────────────────────────────────────────────┘
```

**Frontend Service Boundaries:**
```
┌─────────────────────────────────────────────────────────────┐
│                    External APIs                             │
│  PokeAPI ────────────────────────────────────────┐           │
│  Pinata API ─────────────────────────────────────│           │
│  IPFS Gateways ──────────────────────────────────│           │
└──────────────────────────────────────────────────┼───────────┘
                                                   │
                                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Routes (Server)                       │
│  /api/ipfs/image ─────── Pinata JWT protected                │
│  /api/ipfs/metadata ──── Server-side only                    │
└─────────────────────────────────────────────────────────────┘
                                                   │
                                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Custom Hooks (Client)                     │
│  hooks/pokemon/ ─────── PokeAPI queries                      │
│  hooks/contracts/ ───── wagmi contract interactions          │
│  hooks/ipfs/ ────────── IPFS operations                      │
└─────────────────────────────────────────────────────────────┘
                                                   │
                                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
│  Presentation layer only                                     │
│  No direct API/contract calls                                │
│  Use hooks for all data                                      │
└─────────────────────────────────────────────────────────────┘
```

### Requirements to Structure Mapping

**Epic 1: Wallet Management (FR-060)**
```
Components:  src/components/WalletConnect.tsx
             src/components/WalletStatus.tsx
             src/components/NetworkSwitcher.tsx
Config:      src/app/providers.tsx
Page:        src/app/page.tsx
```

**Epic 2: Card Minting (FR-001 to FR-006, FR-050 to FR-053)**
```
Contract:    contracts/contracts/PokemonCards.sol
Hooks:       src/hooks/contracts/useMintCard.ts
             src/hooks/ipfs/usePinImage.ts
             src/hooks/ipfs/usePinMetadata.ts
             src/hooks/pokemon/usePokemon.ts
Components:  src/components/PokemonCard.tsx
             src/components/MintButton.tsx
API:         src/app/api/ipfs/image/route.ts
             src/app/api/ipfs/metadata/route.ts
Page:        src/app/catalog/page.tsx
Tests:       contracts/test/PokemonCards.test.ts
```

**Epic 3: Inventory Management (FR-010 to FR-012, FR-061)**
```
Hooks:       src/hooks/contracts/useOwnedCards.ts
             src/hooks/contracts/useCardMeta.ts
             src/hooks/ipfs/useFetchMetadata.ts
Components:  src/components/PokemonGrid.tsx
             src/components/CardDetail.tsx
             src/components/LockIndicator.tsx
Page:        src/app/inventory/page.tsx
```

**Epic 4: Trade Creation (FR-030 to FR-032, FR-062)**
```
Contract:    contracts/contracts/TradeMarket.sol
Hooks:       src/hooks/contracts/useCreateOffer.ts
             src/hooks/contracts/useCancelOffer.ts
             src/hooks/contracts/useCooldownRemaining.ts
Components:  src/components/TradeOfferForm.tsx
             src/components/CooldownTimer.tsx
Page:        src/app/trade/page.tsx
Tests:       contracts/test/TradeMarket.test.ts
```

**Epic 5: Trade Acceptance (FR-033 to FR-035, FR-063)**
```
Hooks:       src/hooks/contracts/useAcceptOffer.ts
             src/hooks/contracts/useOpenOffers.ts
Components:  src/components/TradeOfferCard.tsx
Page:        src/app/trade/page.tsx
Tests:       contracts/test/Integration.test.ts
```

**Epic 6: History & Traceability (FR-040 to FR-042, FR-065)**
```
Hooks:       src/hooks/contracts/useContractEvents.ts
Components:  src/components/HistoryList.tsx
Page:        src/app/history/page.tsx
Lib:         src/lib/format.ts (formatAddress)
```

**Epic 7: Time Constraints (FR-020 to FR-024)**
```
Contract:    contracts/contracts/PokemonCards.sol (lockUntil)
             contracts/contracts/TradeMarket.sol (cooldown)
Hooks:       src/hooks/contracts/useCooldownRemaining.ts
Components:  src/components/CooldownTimer.tsx
             src/components/LockIndicator.tsx
Tests:       contracts/test/Cooldown.test.ts
```

### Integration Points

**Contract ↔ Frontend:**
- ABIs copied to `src/lib/contracts/abis/` after compilation
- Addresses configured in `src/lib/contracts/addresses.ts`
- wagmi config imports both in `src/lib/contracts/config.ts`

**Frontend ↔ External Services:**
- PokeAPI: Direct fetch in `src/lib/pokeapi.ts`, used by hooks
- Pinata: Server-only via `/api/ipfs/*` routes
- IPFS Gateways: Fallback chain in `src/lib/ipfs.ts`

**Data Flow:**
```
User Action → Hook → wagmi → MetaMask → RPC → Contract
                                ↓
Contract Event → useWatchContractEvent → invalidateQueries → UI Update
```

### Development Workflow Integration

**Docker Compose Flow:**
```bash
docker-compose up
# 1. hardhat service starts on :8545
# 2. hardhat auto-deploys contracts
# 3. frontend service starts on :3000
# 4. frontend connects to hardhat network
```

**Manual Development Flow:**
```bash
# Terminal 1: Contracts
cd contracts && npx hardhat node

# Terminal 2: Deploy
cd contracts && npx hardhat run scripts/deploy.ts --network localhost
# Copy addresses to frontend/src/lib/contracts/addresses.ts

# Terminal 3: Frontend
cd frontend && pnpm dev
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices work together without conflicts:
- Next.js 14 + wagmi 2.x + viem 2.x: Compatible (wagmi built on viem)
- Solidity 0.8.20 + OpenZeppelin 5.x: Compatible
- React Query + wagmi hooks: wagmi uses @tanstack/react-query internally
- TypeScript strict + bigint types: Consistent throughout
- Docker Compose orchestration: Works with Hardhat + Next.js

**Pattern Consistency:**
- Naming conventions applied consistently: camelCase (vars), PascalCase (components/events), UPPER_SNAKE_CASE (constants)
- Hook naming follows `use` + `Action` + `Target` pattern throughout
- Query keys use `['resource', ...params]` format consistently
- Error format uses Toast-ready structure in all locations

**Structure Alignment:**
- Project structure supports all defined hooks and components
- API routes match nested organization pattern
- Test locations follow co-location (frontend) and convention (contracts)
- Docker Compose aligns with dual-project structure

### Requirements Coverage Validation ✅

**Epic Coverage:**

| Epic | Status | Key Components |
|------|--------|----------------|
| Epic 1: Wallet Management | ✅ | WalletConnect, WalletStatus, NetworkSwitcher |
| Epic 2: Card Minting | ✅ | PokemonCards.sol, useMintCard, API routes |
| Epic 3: Inventory | ✅ | useOwnedCards, useCardMeta, inventory page |
| Epic 4: Trade Creation | ✅ | TradeMarket.sol, useCreateOffer |
| Epic 5: Trade Acceptance | ✅ | useAcceptOffer, useOpenOffers |
| Epic 6: History | ✅ | useContractEvents, HistoryList |
| Epic 7: Time Constraints | ✅ | CooldownTimer, LockIndicator |

**Functional Requirements Coverage:**
- FR-001 to FR-006 (Tokens): PokemonCards.sol + useMintCard ✅
- FR-010 to FR-012 (Ownership): Contract limits + useOwnedCards ✅
- FR-020 to FR-024 (Time): lockUntil/cooldown + timer components ✅
- FR-030 to FR-035 (Trade): TradeMarket.sol + trade hooks ✅
- FR-040 to FR-042 (Trace): previousOwners + useContractEvents ✅
- FR-050 to FR-053 (IPFS): API routes + IPFS hooks ✅
- FR-060 to FR-065 (Frontend): All pages + components mapped ✅

**Non-Functional Requirements Coverage:**
- NFR-001 (UI load < 2s): React Query caching, skeleton loaders ✅
- NFR-003 (IPFS fetch < 3s): Gateway fallback chain ✅
- NFR-004 (Gas < 200k mint): Optimizer 200 runs, minimal storage ✅
- NFR-005 (Gas < 300k trade): Efficient swap logic ✅
- NFR-010 (Reentrancy): ReentrancyGuard in spec ✅
- NFR-013 (Server-side JWT): API routes pattern ✅
- NFR-030 (>80% coverage): Test file structure defined ✅

### Implementation Readiness Validation ✅

**Decision Completeness:**
- All technology choices documented with specific versions
- Implementation patterns cover 8 conflict points
- Good/anti-pattern examples provided for each area
- Enforcement guidelines clearly stated

**Structure Completeness:**
- 100+ files/directories explicitly defined
- All hooks named and organized by data source
- All components listed with purpose
- API routes, pages, configs all specified

**Pattern Completeness:**
- Naming conventions: Solidity, hooks, components, types ✅
- Type patterns: CardMeta, TradeOffer, bigint handling ✅
- Error patterns: CONTRACT_ERRORS map, toast-ready format ✅
- Communication patterns: Event watching, query invalidation ✅

### Gap Analysis Results

**Critical Gaps:** None identified

**Important Gaps (Non-blocking):**
1. Contract ABI sync process not documented (manual copy step needed)
2. Environment variable templates listed but content not specified
3. TradeMarket approval flow mentioned in spec but not explicit in architecture

**Nice-to-Have Gaps:**
1. Vitest configuration for frontend testing
2. ESLint custom rules for pattern enforcement
3. CI/CD pipeline content

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Medium-High)
- [x] Technical constraints identified (gas limits, rate limits)
- [x] Cross-cutting concerns mapped (6 identified)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined (wagmi hooks, API routes)
- [x] Performance considerations addressed (caching, staleTime)

**✅ Implementation Patterns**
- [x] Naming conventions established (8 conflict points)
- [x] Structure patterns defined (hooks by source, flat components)
- [x] Communication patterns specified (event watching, query keys)
- [x] Process patterns documented (loading states, error handling)

**✅ Project Structure**
- [x] Complete directory structure defined (100+ files)
- [x] Component boundaries established (Contract ↔ Frontend ↔ External)
- [x] Integration points mapped (Data flow diagram)
- [x] Requirements to structure mapping complete (7 epics mapped)

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
1. Complete FR/NFR coverage - Every requirement maps to architectural component
2. Strong pattern consistency - 8 conflict points addressed with examples
3. Docker-based workflow - Reproducible development environment
4. Educational clarity - Structure enables < 30 min onboarding goal

**Areas for Future Enhancement:**
1. Add ABI sync automation (post-compile script)
2. Define CI/CD pipeline content
3. Add Vitest config for frontend testing
4. Consider The Graph integration for event indexing (post-MVP)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
```bash
# 1. Initialize projects
pnpm create next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --use-pnpm
mkdir contracts && cd contracts && pnpm init -y && pnpm add -D hardhat

# 2. Set up Docker Compose
# Create docker-compose.yml at project root

# 3. Implement smart contracts (Epic 2 foundation)
# PokemonCards.sol first, then TradeMarket.sol
```

