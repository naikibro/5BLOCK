# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**5BLOCK** is a decentralized application (DApp) for trading Pokémon cards built on the Ethereum blockchain. Users can mint tokenized Pokémon cards from Generation 1 (151 Pokémon), manage a collection (max 4 cards), and trade cards with other users through a decentralized marketplace.

## Tech Stack

### Frontend

- **Next.js 14** (App Router)
- **TypeScript 5.x** (strict mode)
- **wagmi 2.x** / **viem 2.x** (Ethereum interaction)
- **shadcn/ui** (Radix UI + Tailwind CSS)
- **@tanstack/react-query 5.x** (state management)

### Blockchain

- **Solidity 0.8.20**
- **OpenZeppelin Contracts 5.x**
- **Hardhat 2.x** (development framework)
- **Networks**: Hardhat local (chainId 31337), Sepolia testnet (11155111)

### External Services

- **Pinata** (IPFS storage for images and metadata)
- **PokeAPI** (Pokémon data source)
- **QuickNode** (Ethereum RPC provider)
- **MetaMask** (wallet)

## Smart Contracts

### PokemonCards.sol (ERC721)

NFT contract for Pokémon trading cards with:

- Max 4 cards per wallet
- 10-minute lock after acquisition
- On-chain ownership history (`previousOwners`)

Key functions:

- `mint(pokemonId, rarityTier, value, tokenURI)`
- `getCardMeta(tokenId)`
- `getPreviousOwners(tokenId)`
- `isLocked(tokenId)`

### TradeMarket.sol

Marketplace for atomic card swaps:

- 5-minute cooldown between trade actions
- Create, cancel, accept offers

Key functions:

- `createOffer(makerTokenId, takerTokenId)`
- `cancelOffer(offerId)`
- `acceptOffer(offerId)`
- `getCooldownRemaining(address)`

## Project Constants

| Constant             | Value      |
| -------------------- | ---------- |
| MAX_CARDS_PER_WALLET | 4          |
| COOLDOWN_DURATION    | 5 minutes  |
| LOCK_DURATION        | 10 minutes |
| MAX_POKEMON_ID       | 151        |

## Rarity Tiers

| Tier | Name      | Score (HP+ATK+DEF) |
| ---- | --------- | ------------------ |
| 1    | COMMON    | < 150              |
| 2    | UNCOMMON  | 150-199            |
| 3    | RARE      | 200-249            |
| 4    | LEGENDARY | >= 250             |

## Development Commands

```bash
# Install dependencies
pnpm install

# Run local Hardhat node
pnpm hardhat node

# Deploy contracts
pnpm hardhat run scripts/deploy.ts --network localhost

# Run tests
pnpm hardhat test

# Run frontend dev server
pnpm dev
```

## Frontend Routes

- `/` - Home + wallet connect
- `/catalog` - Browse & mint Pokémon cards
- `/inventory` - View owned cards
- `/trade` - Create/view/accept trade offers
- `/history` - Transaction events and ownership history

## IPFS Metadata Format

```json
{
  "name": "Pikachu #25",
  "description": "A Rare Pokémon trading card.",
  "image": "ipfs://QmImageCID",
  "attributes": [
    { "trait_type": "Type", "value": "Electric" },
    { "trait_type": "HP", "value": 35 },
    { "trait_type": "Attack", "value": 55 },
    { "trait_type": "Defense", "value": 40 },
    { "trait_type": "Rarity", "value": "RARE" },
    { "trait_type": "Value", "value": 130 }
  ]
}
```

## Testing Requirements

- Smart contract coverage target: > 80%
- Test all happy paths and revert conditions
- Manual E2E tests on Hardhat local and Sepolia

## References

- [QuickNode Ethereum Quickstart](https://www.quicknode.com/docs/ethereum/quickstart)
- [PokeAPI Documentation](https://pokeapi.co/docs/v2)
- [Pinata IPFS Documentation](https://docs.pinata.cloud/)
- [wagmi Documentation](https://wagmi.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
