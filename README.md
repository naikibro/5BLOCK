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

## Quick Start

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

# Copy environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# QuickNode RPC endpoint
NEXT_PUBLIC_QUICKNODE_URL=your_quicknode_endpoint

# Pinata IPFS
PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_PINATA_GATEWAY=your_pinata_gateway

# Contract addresses (after deployment)
NEXT_PUBLIC_POKEMON_CARDS_ADDRESS=0x...
NEXT_PUBLIC_TRADE_MARKET_ADDRESS=0x...
```

### Run Local Development

```bash
# Start local Hardhat node
pnpm hardhat node

# Deploy contracts (in another terminal)
pnpm hardhat run scripts/deploy.ts --network localhost

# Start frontend dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy to Sepolia Testnet

```bash
# Deploy contracts to Sepolia
pnpm hardhat run scripts/deploy.ts --network sepolia
```

## Smart Contracts

### PokemonCards.sol

ERC721 NFT contract for Pokemon trading cards.

| Function | Description |
|----------|-------------|
| `mint(pokemonId, rarityTier, value, tokenURI)` | Mint a new card (max 4 per wallet) |
| `getCardMeta(tokenId)` | Get card metadata |
| `getPreviousOwners(tokenId)` | Get ownership history |
| `isLocked(tokenId)` | Check if card is locked |

### TradeMarket.sol

Marketplace for peer-to-peer card trading.

| Function | Description |
|----------|-------------|
| `createOffer(makerTokenId, takerTokenId)` | Create a trade offer |
| `acceptOffer(offerId)` | Accept an offer (atomic swap) |
| `cancelOffer(offerId)` | Cancel your offer |
| `getCooldownRemaining(address)` | Check cooldown status |

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
# Run smart contract tests
pnpm hardhat test

# Run with coverage
pnpm hardhat coverage
```

Target coverage: > 80% for all contracts.

## Project Structure

```
5block/
├── contracts/           # Solidity smart contracts
│   ├── PokemonCards.sol
│   └── TradeMarket.sol
├── scripts/             # Deployment scripts
├── test/                # Contract tests
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and config
│   └── types/           # TypeScript types
├── docs/                # Project documentation
│   ├── specs/           # Technical specifications
│   └── user-stories/    # User stories
└── hardhat.config.ts    # Hardhat configuration
```

## Documentation

Detailed documentation is available in the [docs](./docs) folder:

- [Technical Requirements](./docs/specs/technical-requirements.md)
- [Smart Contract Specs](./docs/specs/smart-contracts.md)
- [Tech Stack Details](./docs/specs/tech-stack.md)
- [User Stories](./docs/user-stories/README.md)

## Networks

| Network | Chain ID | RPC |
|---------|----------|-----|
| Hardhat Local | 31337 | http://localhost:8545 |
| Sepolia Testnet | 11155111 | QuickNode endpoint |

## License

MIT
