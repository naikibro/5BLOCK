![logo](./documentation/static/img/logo.png)
# 5BLOCK - Pokemon Trading Cards DApp


Mint, collect and trade Pokemon NFT cards on Ethereum.

---

## Prerequisites

> **Requis:**
>
> - Node.js 18+
> - pnpm
> - Extension MetaMask

---

## Quick Start

### 1. Install Dependencies

```bash
git clone https://github.com/naikibro/5block.git
cd 5block
pnpm install
```

### 2. Start Local Blockchain

```bash
pnpm run node
```

Gardez ce terminal ouvert.

### 3. Deploy Contract

Dans un nouveau terminal:

```bash
pnpm run deploy:local
```

Copiez l'adresse du contrat affichée.

### 4. Configure Frontend

```bash
cd frontend
```

Créez `.env.local`:

```bash
NEXT_PUBLIC_POKEMON_CARDS_ADDRESS=<paste_contract_address>
PINATA_JWT=skip
```

Installez et démarrez:

```bash
pnpm install
pnpm dev
```

### 5. Configure MetaMask

Ajoutez le réseau Hardhat Local:

- **RPC**: http://127.0.0.1:8545
- **Chain ID**: 31337

Importez le compte de test (clé privée de l'étape 2).

### 6. Open App

Naviguez vers http://localhost:3000/catalog et mintez votre première carte !

---

## Available Commands

```bash
pnpm run node           # Démarre le nœud local Hardhat
pnpm run deploy:local   # Déploie sur le nœud local
pnpm run deploy:sepolia # Déploie sur Sepolia
pnpm test               # Lance les tests du contrat
cd frontend && pnpm dev # Démarre le frontend
```

---

## App Routes

| Route | Description |
| ----- | ----------- |
| `/` | Accueil et connexion wallet |
| `/catalog` | Parcourir et minter des cartes |
| `/inventory` | Votre collection |
| `/trade` | Marketplace |

---

## Tech Stack

**Frontend:** Next.js 14, TypeScript, wagmi, viem, shadcn/ui  
**Smart Contracts:** Solidity 0.8.20, OpenZeppelin, Hardhat  
**Storage:** Pinata (IPFS)  
**Data:** PokeAPI

---

## Documentation

- **[DEPLOY.md](./DEPLOY.md)** - Guide de déploiement (local ou Sepolia)