---
id: intro
slug: /
title: Getting Started
sidebar_position: 1
---
![logo](../static/img/logo.png)

# 5BLOCK - Pokemon Trading Cards DApp

Mint, collect and trade Pokemon NFT cards on Ethereum.

---

## Prerequisites

> **Required:**
>
> - Node.js 18+
> - pnpm
> - MetaMask extension

---

## Quick Start

### 1. Install Dependencies

```bash
git clone <repository>
cd 5block
pnpm install
```

### 2. Start Local Blockchain

```bash
pnpm run node
```

Keep this terminal open.

### 3. Deploy Contract

In a new terminal:

```bash
pnpm run deploy:local
```

Copy the displayed contract address.

### 4. Configure Frontend

```bash
cd frontend
```

Create `.env.local`:

```bash
NEXT_PUBLIC_POKEMON_CARDS_ADDRESS=<paste_contract_address>
PINATA_JWT=skip
```

Install and start:

```bash
pnpm install
pnpm dev
```

### 5. Configure MetaMask

Add Hardhat Local network:

- **RPC**: http://127.0.0.1:8545
- **Chain ID**: 31337

Import test account (private key from step 2).

### 6. Open App

Navigate to http://localhost:3000/catalog and mint your first card!

---

## Available Commands

```bash
pnpm run node           # Start Hardhat local node
pnpm run deploy:local   # Deploy to local node
pnpm test               # Run contract tests
cd frontend && pnpm dev # Start frontend
```

---

## App Routes

| Route | Description |
| ----- | ----------- |
| `/` | Home & wallet connection |
| `/catalog` | Browse and mint cards |
| `/inventory` | Your collection |
| `/trade` | Marketplace |
