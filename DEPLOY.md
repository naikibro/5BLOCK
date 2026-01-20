# 🚀 Déploiement

## Test Local (5 minutes)

**Terminal 1:**
```bash
pnpm run node
```

**Terminal 2:**
```bash
pnpm run deploy:local
# Copier l'adresse affichée
```

**Terminal 3:**
```bash
cd frontend
# Créer .env.local:
echo "NEXT_PUBLIC_POKEMON_CARDS_ADDRESS=<paste_address>" > .env.local
echo "PINATA_JWT=skip" >> .env.local
pnpm dev
```

**MetaMask:**
- Add network: Hardhat Local (RPC: http://127.0.0.1:8545, Chain ID: 31337)
- Import test account: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

Open http://localhost:3000/catalog

---

## Sepolia Testnet

**1. Get Sepolia ETH:** https://sepoliafaucet.com

**2. Configure `.env` at root:**
```bash
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=your_key
```

**3. Deploy:**
```bash
pnpm run deploy:sepolia
```

**4. Configure `frontend/.env.local`:**
```bash
NEXT_PUBLIC_POKEMON_CARDS_ADDRESS=<deployed_address>
PINATA_JWT=<your_pinata_jwt>
```

Get Pinata JWT: https://pinata.cloud → API Keys → New Key

**5. Start:**
```bash
cd frontend && pnpm dev
```

---

## Troubleshooting

**"Insufficient funds"** → Get Sepolia ETH from faucet  
**"PINATA_JWT not configured"** → Add JWT in frontend/.env.local  
**"Wrong network"** → Switch MetaMask to correct network  
**"Nonce too high"** → MetaMask → Settings → Advanced → Clear activity

---

## Verify Deployment

**Local:**
```bash
pnpm test  # 27/27 tests should pass
```

**Sepolia:**
Check on https://sepolia.etherscan.io/address/YOUR_ADDRESS
