---
id: catalog
title: Catalog
sidebar_position: 1
---

# Catalog

Browse and mint Pokemon cards from the complete Gen 1 collection.

---

## Overview

The Catalog displays all 151 Generation 1 Pokemon. Each Pokemon can be minted **exactly once** as a unique NFT card.

---

## How It Works

### 1. Browse Pokemon

The catalog shows all 151 Pokemon with:
- Sprite image
- Name and ID
- Type(s)
- Base stats (HP, Attack, Defense)
- Calculated rarity

### 2. Check Availability

Pokemon are marked as:
- **Available** - Can be minted
- **Minted** - Already exists as a card (shows current owner)

### 3. Mint Card

Click an available Pokemon to mint it as your NFT card:
1. Confirm the transaction in MetaMask
2. Wait for blockchain confirmation
3. Card appears in your inventory

---

## Rarity System

Rarity is calculated from base stats:

```
Score = HP + Attack + Defense
```

| Tier | Name | Score Range | Example |
|------|------|-------------|---------|
| 1 | COMMON | < 150 | Magikarp (100) |
| 2 | UNCOMMON | 150-199 | Pikachu (130) |
| 3 | RARE | 200-249 | Charizard (227) |
| 4 | LEGENDARY | >= 250 | Mewtwo (286) |

### Rarity Distribution

Gen 1 Pokemon distribution by rarity:

| Rarity | Count | % of Total |
|--------|-------|------------|
| Common | ~60 | 40% |
| Uncommon | ~50 | 33% |
| Rare | ~35 | 23% |
| Legendary | ~6 | 4% |

---

## Data Source

Pokemon data comes from [PokeAPI](https://pokeapi.co):
- Official sprites
- Accurate base stats
- Type information
- Names in multiple languages

---

## Metadata Storage

When you mint a card, metadata is stored on IPFS:

```json
{
  "name": "Pikachu #25",
  "description": "A Rare Pokemon trading card.",
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

This ensures your card's data persists even if 5BLOCK goes offline.

---

## Limitations

- **Max 4 cards per wallet** - You cannot mint if you already own 4 cards
- **One per Pokemon** - Each Pokemon can only be minted once globally
- **Gas required** - Minting costs gas (SepoliaETH on testnet)
