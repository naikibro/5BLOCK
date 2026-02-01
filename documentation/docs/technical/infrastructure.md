---
id: infrastructure
title: Infrastructure
sidebar_position: 2
---

# Infrastructure

How 5BLOCK components work together.

---

## System Architecture

```mermaid
flowchart TB
    subgraph User
        Browser[Browser + MetaMask]
    end

    subgraph Frontend["Frontend (Next.js)"]
        UI[React UI]
        Wagmi[wagmi/viem]
        Query[TanStack Query]
    end

    subgraph Blockchain["Ethereum Network"]
        PC[PokemonCards.sol]
        TM[TradeMarket.sol]
    end

    subgraph External["External Services"]
        Poke[PokeAPI]
        IPFS[Pinata/IPFS]
        RPC[QuickNode RPC]
    end

    Browser --> UI
    UI --> Wagmi
    UI --> Query
    Wagmi --> RPC
    RPC --> PC
    RPC --> TM
    Query --> Poke
    UI --> IPFS
    PC --> TM
```

---

## Component Responsibilities

### Frontend (Next.js)

- **UI Layer**: React components for catalog, inventory, trade, history
- **Wallet Integration**: MetaMask connection via wagmi
- **State Management**: TanStack Query for caching and async state
- **Data Fetching**: PokeAPI for Pokemon stats, IPFS for metadata

### Smart Contracts

- **PokemonCards.sol**: ERC-721 NFT contract managing card ownership, minting, locks
- **TradeMarket.sol**: Marketplace contract handling trade offers and atomic swaps

### External Services

- **QuickNode**: RPC endpoint for blockchain communication
- **PokeAPI**: Source of Pokemon data (stats, types, sprites)
- **Pinata/IPFS**: Decentralized storage for NFT metadata and images

---

## Data Flow

### Minting a Card

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant P as PokeAPI
    participant I as IPFS
    participant C as PokemonCards

    U->>F: Select Pokemon to mint
    F->>P: Fetch Pokemon data
    P-->>F: Stats, type, image URL
    F->>I: Upload metadata JSON
    I-->>F: IPFS CID
    F->>C: mint(pokemonId, rarity, value, ipfsURI)
    C-->>F: TokenId + CardMinted event
    F-->>U: Show minted card
```

### Trading Cards

```mermaid
sequenceDiagram
    participant M as Maker
    participant T as Taker
    participant TM as TradeMarket
    participant PC as PokemonCards

    M->>TM: createOffer(myToken, wantToken)
    TM-->>M: OfferId + TradeCreated event
    T->>TM: acceptOffer(offerId)
    TM->>PC: transferFrom(maker, taker, makerToken)
    TM->>PC: transferFrom(taker, maker, takerToken)
    TM-->>T: TradeAccepted event
```

---

## Security Model

### On-Chain Security

- **ReentrancyGuard**: Prevents reentrancy attacks on mint and trade
- **Ownership Checks**: Only token owners can create offers or transfer
- **Lock Mechanism**: 10-minute lock prevents rapid arbitrage
- **Cooldown**: 5-minute cooldown between trade actions

### Off-Chain Security

- **MetaMask**: User controls private keys, never exposed to app
- **IPFS**: Immutable content addressing ensures metadata integrity
- **No Backend**: No centralized server means no single point of compromise

---

## Deployment Architecture

### Local Development

```
┌─────────────────┐     ┌──────────────────┐
│  Next.js Dev    │────▶│  Hardhat Node    │
│  localhost:3000 │     │  localhost:8545  │
└─────────────────┘     └──────────────────┘
```

### Production (Sepolia)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Next.js App    │────▶│  QuickNode RPC   │────▶│  Sepolia Chain  │
│  (Vercel/etc)   │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```
