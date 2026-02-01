---
id: history
title: History
sidebar_position: 4
---

# History

View transaction history and card provenance.

---

## Overview

The History feature provides transparency into all activity on the platform. Every mint, transfer, and trade is permanently recorded on-chain.

---

## Event Types

### CardMinted

Emitted when a new card is created.

| Field | Description |
|-------|-------------|
| `owner` | Address that minted the card |
| `tokenId` | Unique identifier |
| `pokemonId` | Pokemon species (1-151) |
| `rarityTier` | Rarity level (1-4) |

### CardTransferred

Emitted when a card changes owners.

| Field | Description |
|-------|-------------|
| `tokenId` | Card being transferred |
| `from` | Previous owner |
| `to` | New owner |

### CardLocked

Emitted when a card's lock period starts.

| Field | Description |
|-------|-------------|
| `tokenId` | Card being locked |
| `until` | Timestamp when lock expires |

### TradeCreated

Emitted when a trade offer is created.

| Field | Description |
|-------|-------------|
| `offerId` | Unique offer identifier |
| `maker` | Address creating the offer |
| `makerTokenId` | Card being offered |
| `takerTokenId` | Card requested |

### TradeAccepted

Emitted when a trade completes.

| Field | Description |
|-------|-------------|
| `offerId` | Offer that was accepted |
| `taker` | Address accepting the offer |
| `maker` | Original offer creator |

### TradeCancelled

Emitted when an offer is cancelled.

| Field | Description |
|-------|-------------|
| `offerId` | Cancelled offer ID |

---

## Provenance Tracking

### What is Provenance?

Provenance is the complete ownership history of a card. Like art authentication, it proves:
- Who minted the card
- Every subsequent owner
- When each transfer happened

### On-Chain Storage

The `PokemonCards` contract stores previous owners:

```solidity
mapping(uint256 => address[]) private _previousOwners;
```

Query with:

```solidity
function getPreviousOwners(uint256 tokenId)
    external view returns (address[] memory)
```

### Why Provenance Matters

- **Authenticity** - Verify the card's origin
- **History** - See its journey through collectors
- **Value** - Provenance can add collector value
- **Transparency** - No hidden ownership changes

---

## Viewing History

### Your Activity

See your personal history:
- Cards you've minted
- Trades you've created
- Trades you've accepted
- Cards you've received/sent

### Card History

Click any card to see its complete history:
- Minting event
- All transfers with timestamps
- Lock events
- Trade events (if traded via marketplace)

### Global Activity

View platform-wide recent activity:
- Latest mints
- Recent trades
- New offers

---

## Verifying On-Chain

All events can be verified on Etherscan:

1. Go to [sepolia.etherscan.io](https://sepolia.etherscan.io)
2. Search for contract address
3. Click "Events" tab
4. Filter by event type

This provides independent verification outside of 5BLOCK.

---

## Data Retention

### Permanent Storage

Blockchain data is permanent:
- Events are stored forever
- Previous owners list grows with each transfer
- No data can be deleted or modified

### Scalability Note

The `getPreviousOwners()` function returns all owners. For cards with many transfers, this could be gas-intensive to query. Consider pagination for production use.

---

## Technical Details

### Querying Events

Events are indexed for efficient querying:

```javascript
// Example: Get all CardMinted events for an address
const filter = pokemonCards.filters.CardMinted(ownerAddress);
const events = await pokemonCards.queryFilter(filter);
```

### Block Timestamps

Each event includes the block timestamp, providing an immutable record of when it occurred.
