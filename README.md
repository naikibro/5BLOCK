# 5BLOCK - Pokemon Trading Card DApp

A decentralized application for trading Pokemon cards on the Ethereum blockchain.

## Overview

5BLOCK allows users to:
- **Mint** tokenized Pokemon cards from Generation 1 (151 Pokemon)
- **Collect** up to 4 cards per wallet
- **Trade** cards with other users through a decentralized marketplace
- **Track** ownership history on-chain

## Features

- **ERC721 NFT Cards**: Each Pokemon card is a unique, tradeable NFT
- **IPFS Storage**: Images and metadata stored on IPFS via Pinata
- **Atomic Swaps**: Secure peer-to-peer trading without escrow
- **Anti-Spam Mechanisms**: 5-minute cooldown between trades, 10-minute lock after acquisition
- **Ownership History**: Full traceability of previous card owners

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, wagmi, viem, shadcn/ui |
| Smart Contracts | Solidity 0.8.20, OpenZeppelin, Hardhat |
| Storage | Pinata (IPFS) |
| Data Source | PokeAPI |
| RPC Provider | QuickNode |
| Wallet | MetaMask |

## 🚀 Quick Start

### ⚡ Local Development (5 minutes)

**Terminal 1 - Start Hardhat node:**
```bash
pnpm run node
```

**Terminal 2 - Deploy contract:**
```bash
pnpm run deploy:local
# Copy the address displayed
```

**Terminal 3 - Configure and start frontend:**
```bash
cd frontend
# Create .env.local with:
# NEXT_PUBLIC_POKEMON_CARDS_ADDRESS=<paste_address>
# PINATA_JWT=skip
pnpm dev
```

**Configure MetaMask:**
- Add network: Hardhat Local (RPC: http://127.0.0.1:8545, Chain ID: 31337)
- Import test account (private key from Terminal 1)

Open http://localhost:3000/catalog and mint your first card!

### 🌐 Sepolia Testnet Deployment

**1. Configure `.env` at root:**
```bash
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_key
```

**2. Deploy:**
```bash
pnpm run deploy:sepolia
```

**3. Configure `frontend/.env.local`:**
```bash
NEXT_PUBLIC_POKEMON_CARDS_ADDRESS=<deployed_address>
PINATA_JWT=<your_pinata_jwt>
```

**4. Start frontend:**
```bash
cd frontend && pnpm dev
```

### Prerequisites

- Node.js 18+
- pnpm
- MetaMask browser extension

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/5block.git
cd 5block

# Install dependencies
pnpm install

# Dans le frontend
cd frontend
pnpm install
```


## Smart Contracts

### PokemonCards.sol
ERC721 NFT contract with mint limit (4 cards/wallet), 10-minute lock, and ownership history.

**Key functions:** `mint()`, `getCardMeta()`, `isLocked()`, `getOwnedCount()`

**Tests:** 27/27 passing ✅

### TradeMarket.sol
Coming soon (Epic 3)

## Rarity System

Rarity is calculated from Pokemon base stats (HP + Attack + Defense):

| Tier | Rarity | Score | Badge Color |
|------|--------|-------|-------------|
| 1 | Common | < 150 | Gray |
| 2 | Uncommon | 150-199 | Green |
| 3 | Rare | 200-249 | Blue |
| 4 | Legendary | >= 250 | Gold |

## Application Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with wallet connection |
| `/catalog` | Browse and mint Pokemon cards |
| `/inventory` | View your card collection |
| `/trade` | Marketplace for trading cards |
| `/history` | Transaction and ownership history |

## Game Rules

- **Max Cards**: Each wallet can hold up to 4 cards
- **Lock Period**: Cards are locked for 10 minutes after minting or receiving in a trade
- **Cooldown**: 5-minute cooldown between trade actions (create, accept, cancel)
- **Pokemon Range**: Only Generation 1 Pokemon (#1-151) are available

## Testing

```bash
# Smart contract tests (27 tests)
pnpm test

# Frontend tests (34 tests)  
cd frontend && pnpm test

# Lint
cd frontend && pnpm run lint
```

## Project Structure

```
5block/
├── contracts/           # Solidity smart contracts
│   └── PokemonCards.sol
├── scripts/             # Deployment scripts  
│   └── deploy.ts
├── test/                # Contract tests (27 tests)
│   └── PokemonCards.test.ts
├── frontend/
│   └── src/
│       ├── app/         # Pages: /, /catalog, /inventory
│       ├── components/  # UI components
│       ├── hooks/       # React hooks
│       ├── lib/         # Utils, contracts, API services
│       └── types/       # TypeScript types
├── docs/                # Documentation
│   ├── specs/           # Technical specs
│   └── user-stories/    # User stories
├── hardhat.config.ts    # Hardhat config
└── DEPLOY.md            # Deployment guide
```

## Current Status

```
✅ US-2.1 Pokemon Catalog - DONE (34 tests)
✅ US-2.2 Mint Card - DONE (27 tests)  
⏳ US-2.3 Inventory - Ready for dev
⏳ US-2.4 Card Details - Ready for dev
```

## Deployment

See **[DEPLOY.md](./DEPLOY.md)** for deployment instructions (local or Sepolia).

## Documentation

- [Getting Started](./documentation/) - Launch locally with Docusaurus
- [Smart Contract Specs](./docs/specs/smart-contracts.md)
- [User Stories](./docs/user-stories/)

## Networks

| Network | Chain ID | RPC |
|---------|----------|-----|
| Hardhat Local | 31337 | http://localhost:8545 |
| Sepolia Testnet | 11155111 | QuickNode endpoint |

## License

MIT
