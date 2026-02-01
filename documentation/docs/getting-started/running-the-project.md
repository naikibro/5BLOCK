---
id: running-the-project
title: Running the Project
sidebar_position: 1
---

# Running the Project

Get 5BLOCK running on your local machine.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **pnpm** - Install with `npm install -g pnpm`
- **MetaMask** - Browser extension for wallet management

---

## Installation

### 1. Clone and Install

```bash
git clone https://github.com/naikibro/5BLOCK.git
cd 5block
pnpm install
```

### 2. Start Local Blockchain

Open a terminal and run:

```bash
pnpm run node
```

This starts a local Hardhat node at `http://127.0.0.1:8545`.

**Keep this terminal open** - it's your local blockchain.

### 3. Deploy Contracts

In a **new terminal**, deploy the smart contracts:

```bash
pnpm run deploy:local
```

Copy the displayed contract addresses - you'll need them for the frontend.

### 4. Configure Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Create a `.env.local` file:

```bash
NEXT_PUBLIC_POKEMON_CARDS_ADDRESS=<paste_contract_address>
PINATA_JWT=skip
```

Install dependencies and start:

```bash
pnpm install
pnpm dev
```

The app will be available at `http://localhost:3000`.

---

## MetaMask Setup

### Add Hardhat Network

1. Open MetaMask
2. Click the network dropdown
3. Select "Add Network"
4. Enter these details:

| Field | Value |
|-------|-------|
| Network Name | Hardhat Local |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Currency Symbol | ETH |

### Import Test Account

Hardhat provides test accounts with 10,000 ETH each. Import one:

1. In MetaMask, click your account icon
2. Select "Import Account"
3. Paste a private key from the Hardhat node output

---

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm run node` | Start Hardhat local node |
| `pnpm run deploy:local` | Deploy to local node |
| `pnpm run deploy:sepolia` | Deploy to Sepolia testnet |
| `pnpm test` | Run contract tests |
| `cd frontend && pnpm dev` | Start frontend dev server |

---

## App Routes

| Route | Description |
|-------|-------------|
| `/` | Home & wallet connection |
| `/catalog` | Browse and mint cards |
| `/inventory` | Your collection |
| `/trade` | Marketplace |

---

## Troubleshooting

### MetaMask shows wrong nonce

Reset your account in MetaMask: Settings > Advanced > Reset Account

### Contracts not found

Ensure the contract address in `.env.local` matches the deployed address.

### Transaction fails

Check that you're connected to the correct network (Hardhat Local or Sepolia).
