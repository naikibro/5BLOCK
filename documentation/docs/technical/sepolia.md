---
id: sepolia
title: Sepolia Network
sidebar_position: 3
---

# Sepolia Network

5BLOCK uses Sepolia, Ethereum's primary testnet.

---

## Why Sepolia?

### Free Testing

Sepolia ETH has no real value - you can get it for free from faucets. This lets you test minting, trading, and all features without spending real money.

### Production-Like Environment

Unlike local development, Sepolia is a real blockchain network:

- Transactions require gas
- Blocks take ~12 seconds
- Multiple validators secure the network
- Real network latency and conditions

### Persistent State

Your deployed contracts and minted cards persist on Sepolia. Unlike Hardhat local (which resets), Sepolia maintains state across sessions.

---

## Network Details

| Property | Value |
|----------|-------|
| Network Name | Sepolia |
| Chain ID | `11155111` |
| Currency | SepoliaETH |
| Block Time | ~12 seconds |
| Explorer | [sepolia.etherscan.io](https://sepolia.etherscan.io) |

---

## Getting Sepolia ETH

You need SepoliaETH to pay for gas. Get it from faucets:

### Recommended Faucets

| Faucet | Link | Notes |
|--------|------|-------|
| Alchemy | [sepoliafaucet.com](https://sepoliafaucet.com) | Requires Alchemy account |
| Infura | [infura.io/faucet](https://www.infura.io/faucet/sepolia) | Requires Infura account |
| QuickNode | [faucet.quicknode.com](https://faucet.quicknode.com/ethereum/sepolia) | Easy access |

Most faucets provide 0.1-0.5 SepoliaETH per request, which is plenty for testing.

---

## MetaMask Configuration

### Add Sepolia Network

1. Open MetaMask
2. Click the network dropdown
3. Select "Add Network" > "Add a network manually"
4. Enter:

| Field | Value |
|-------|-------|
| Network Name | Sepolia |
| RPC URL | `https://rpc.sepolia.org` |
| Chain ID | `11155111` |
| Currency Symbol | ETH |
| Block Explorer | `https://sepolia.etherscan.io` |

### Alternative: Auto-Add

Most dApps (including 5BLOCK) can add the network automatically. Just connect your wallet and approve the network addition prompt.

---

## RPC Endpoints

5BLOCK uses multiple RPC endpoints for reliability:

| Provider | Endpoint | Priority |
|----------|----------|----------|
| QuickNode | Custom endpoint | Primary |
| Public | `https://rpc.sepolia.org` | Fallback 1 |
| Public | `https://ethereum-sepolia-rpc.publicnode.com` | Fallback 2 |
| Public | `https://rpc2.sepolia.org` | Fallback 3 |

The frontend automatically falls back to the next endpoint if one fails.

---

## Deploying to Sepolia

### Prerequisites

1. SepoliaETH in your deployer wallet
2. QuickNode API key (or use public RPC)

### Deploy

```bash
pnpm run deploy:sepolia
```

### Verify Contract

After deployment, verify on Etherscan:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

---

## Viewing Transactions

All Sepolia transactions are publicly viewable on [sepolia.etherscan.io](https://sepolia.etherscan.io).

Search by:
- Wallet address
- Transaction hash
- Contract address

This transparency is a core feature of blockchain - anyone can verify what happened.
