---
id: inventory
title: Inventory
sidebar_position: 2
---

# Inventory

View and manage your Pokemon card collection.

---

## Overview

The Inventory shows all cards you currently own. This is your personal collection, stored on-chain and secured by your wallet.

---

## Card Display

Each card shows:

| Info | Description |
|------|-------------|
| **Image** | Pokemon sprite from IPFS |
| **Name** | Pokemon name and ID |
| **Rarity** | Tier badge (Common to Legendary) |
| **Stats** | HP, Attack, Defense values |
| **Value** | Total stat score |
| **Lock Status** | Time remaining if locked |

---

## Collection Limit

### Max 4 Cards

Each wallet can hold a maximum of **4 cards**.

**Why this limit?**

- **Prevents Hoarding** - No single wallet can monopolize the collection
- **Encourages Trading** - Must trade to collect different Pokemon
- **Fair Distribution** - More users can participate

### Managing Your Collection

If you have 4 cards and want a new one:
1. Trade one of your cards for the one you want
2. Or wait for someone to offer a trade

---

## Lock Status

After acquiring a card (mint or trade), it's **locked for 10 minutes**.

### Lock Indicator

Locked cards display:
- Lock icon
- Countdown timer
- "Locked until [time]"

### Why Locks?

- **Prevents Rapid Flipping** - Can't instantly resell
- **Reduces Manipulation** - No flash loan exploits
- **Encourages Thoughtful Trades** - Consider before trading

---

## Card Actions

From your inventory, you can:

### View Details

Click a card to see full details:
- Complete stat breakdown
- Minting date
- Ownership history (provenance)
- Token ID

### Create Trade Offer

For unlocked cards, you can create a trade offer:
1. Select your card
2. Choose "Create Offer"
3. Select which card you want in return
4. Confirm the transaction

---

## Ownership Verification

Your cards are truly yours:

- **On-Chain Proof** - Ownership recorded on Ethereum
- **No Custody** - 5BLOCK never holds your cards
- **Transferable** - Standard ERC-721 transfers work
- **Verifiable** - Anyone can confirm ownership on Etherscan

---

## Empty Inventory

If you have no cards:

1. Visit the [Catalog](/features/catalog) to mint your first card
2. Browse the [Trade](/features/trade) marketplace for offers
3. Connect with other collectors

---

## Technical Details

Cards are queried using:
- `balanceOf(address)` - Number of cards owned
- `tokenOfOwnerByIndex(address, index)` - Get each token ID
- `getCardMeta(tokenId)` - On-chain metadata
- `tokenURI(tokenId)` - IPFS metadata link
