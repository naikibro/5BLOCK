---
id: tech-stack
title: Tech Stack
sidebar_position: 1
---

# Tech Stack

5BLOCK is built with modern web3 technologies.

---

## Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.x | React framework with App Router |
| **TypeScript** | 5.x | Type-safe JavaScript (strict mode) |
| **wagmi** | 2.x | React hooks for Ethereum |
| **viem** | 2.x | Low-level Ethereum interactions |
| **shadcn/ui** | - | UI components (Radix + Tailwind) |
| **TanStack Query** | 5.x | Async state management |
| **Tailwind CSS** | 3.x | Utility-first styling |

---

## Blockchain

| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | 0.8.20 | Smart contract language |
| **OpenZeppelin** | 5.x | Secure contract implementations |
| **Hardhat** | 2.x | Development framework |
| **ethers.js** | 6.x | Contract deployment |

### Networks

| Network | Chain ID | Use Case |
|---------|----------|----------|
| Hardhat Local | 31337 | Development & testing |
| Sepolia | 11155111 | Public testnet deployment |

---

## External Services

### Pinata (IPFS)

- **Purpose**: Decentralized storage for card images and metadata
- **Why**: Ensures images persist independently of 5BLOCK servers
- **Docs**: [docs.pinata.cloud](https://docs.pinata.cloud/)

### PokeAPI

- **Purpose**: Pokemon data source (stats, types, images)
- **Why**: Canonical source for Gen 1 Pokemon information
- **Docs**: [pokeapi.co/docs/v2](https://pokeapi.co/docs/v2)

### QuickNode

- **Purpose**: Ethereum RPC provider for Sepolia
- **Why**: Reliable, fast access to testnet blockchain
- **Docs**: [quicknode.com/docs](https://www.quicknode.com/docs/ethereum)

---

## Development Tools

| Tool | Purpose |
|------|---------|
| **pnpm** | Fast, disk-efficient package manager |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Hardhat Console** | Contract debugging |

---

## Why This Stack?

### Next.js 14 + App Router

Modern React patterns with server components, layouts, and streaming. The App Router provides better code organization and performance.

### wagmi + viem

The de facto standard for React + Ethereum. Wagmi provides React hooks that handle wallet connections, contract reads/writes, and chain switching. Viem is the underlying library for low-level operations.

### OpenZeppelin

Battle-tested smart contract implementations. Using audited code for ERC-721 reduces security risks significantly.

### IPFS via Pinata

Decentralized storage ensures card metadata and images aren't dependent on any single server. If 5BLOCK goes down, your NFT metadata remains accessible.
