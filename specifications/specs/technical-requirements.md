# Technical Requirements — DApp Pokémon Cards Exchange

> Exigences techniques détaillées pour le développement du projet.

---

## 1. Exigences Fonctionnelles

### 1.1 Gestion des Tokens (Cartes Pokémon)

| ID | Requirement | Priorité | Source |
|----|-------------|----------|--------|
| **FR-001** | Le système doit permettre de créer (mint) des tokens représentant des cartes Pokémon | Must | Cadrage §1.1 |
| **FR-002** | Chaque token doit avoir un `pokemonId` correspondant à l'ID PokeAPI (1-151) | Must | Cadrage §1.1 |
| **FR-003** | Chaque token doit avoir un `rarityTier` calculé selon les stats | Must | Cadrage §1.1 |
| **FR-004** | Chaque token doit avoir une `value` calculée (HP + Attack + Defense) | Must | Cadrage §1.1 |
| **FR-005** | Chaque token doit pointer vers une metadata JSON sur IPFS via `tokenURI` | Must | Cadrage §1.4 |
| **FR-006** | Les timestamps `createdAt` et `lastTransferAt` doivent être stockés on-chain | Must | Cadrage §1.1 |

### 1.2 Contraintes de Possession

| ID | Requirement | Priorité | Source |
|----|-------------|----------|--------|
| **FR-010** | Un wallet ne peut pas posséder plus de **4 cartes** simultanément | Must | Cadrage §1.3 |
| **FR-011** | Le mint doit être refusé si le wallet atteint la limite de 4 cartes | Must | Cadrage §1.3 |
| **FR-012** | Un transfert doit être refusé si le destinataire atteindrait plus de 4 cartes | Must | Cadrage §1.3 |

### 1.3 Contraintes Temporelles

| ID | Requirement | Priorité | Source |
|----|-------------|----------|--------|
| **FR-020** | Un **cooldown de 5 minutes** doit s'appliquer entre deux actions d'échange par wallet | Must | Cadrage §1.3 |
| **FR-021** | Les actions soumises au cooldown sont : `createOffer`, `cancelOffer`, `acceptOffer` | Must | Cadrage §1.3 |
| **FR-022** | Le mint n'est **pas** soumis au cooldown | Should | Clarification |
| **FR-023** | Une carte doit être **verrouillée 10 minutes** après acquisition (mint ou échange) | Must | Cadrage §1.3 |
| **FR-024** | Une carte verrouillée ne peut pas être proposée ou utilisée dans un échange | Must | Cadrage §1.3 |

### 1.4 Marketplace d'Échange

| ID | Requirement | Priorité | Source |
|----|-------------|----------|--------|
| **FR-030** | Un utilisateur peut créer une offre d'échange spécifiant sa carte et la carte souhaitée | Must | Cadrage §1.2 |
| **FR-031** | Une offre a un statut : `Open`, `Cancelled`, `Accepted` | Must | Cadrage §1.2 |
| **FR-032** | Seul le créateur d'une offre peut l'annuler | Must | Cadrage §1.2 |
| **FR-033** | L'échange doit être **atomique** (les deux transferts dans la même transaction) | Must | Cadrage §1.2 |
| **FR-034** | Lors de l'acceptation, le système doit vérifier que le maker possède toujours sa carte | Must | Cadrage §1.2 |
| **FR-035** | Lors de l'acceptation, le système doit vérifier que le taker possède la carte demandée | Must | Cadrage §1.2 |

### 1.5 Traçabilité

| ID | Requirement | Priorité | Source |
|----|-------------|----------|--------|
| **FR-040** | L'historique des propriétaires (`previousOwners`) doit être maintenu on-chain | Must | Cadrage §1.4 |
| **FR-041** | Des events doivent être émis pour : mint, création/annulation/acceptation d'offre | Must | Cadrage §3.2 |
| **FR-042** | Les events doivent être indexés pour permettre le filtrage (indexed parameters) | Should | Best practice |

### 1.6 IPFS / Métadonnées

| ID | Requirement | Priorité | Source |
|----|-------------|----------|--------|
| **FR-050** | Les images des Pokémon doivent être pinnées sur IPFS via Pinata | Must | Cadrage §2.2 |
| **FR-051** | Les métadonnées JSON doivent être pinnées sur IPFS via Pinata | Must | Cadrage §2.2 |
| **FR-052** | Le format des métadonnées doit suivre le standard NFT (name, image, attributes) | Must | Cadrage §1.4 |
| **FR-053** | Les métadonnées doivent inclure : pokemonId, type, value, rarityTier, previousOwners | Must | Cadrage §1.4 |

### 1.7 Frontend

| ID | Requirement | Priorité | Source |
|----|-------------|----------|--------|
| **FR-060** | L'utilisateur doit pouvoir connecter son wallet MetaMask | Must | Cadrage §1.5 |
| **FR-061** | L'utilisateur doit pouvoir voir le catalogue des Pokémon disponibles | Must | Cadrage §1.5 |
| **FR-062** | L'utilisateur doit pouvoir voir son inventaire de cartes | Must | Cadrage §1.5 |
| **FR-063** | L'utilisateur doit pouvoir créer une offre d'échange | Must | Cadrage §1.5 |
| **FR-064** | L'utilisateur doit pouvoir voir et accepter les offres ouvertes | Must | Cadrage §1.5 |
| **FR-065** | L'utilisateur doit pouvoir voir l'historique des transactions | Should | Cadrage §1.5 |

---

## 2. Exigences Non-Fonctionnelles

### 2.1 Performance

| ID | Requirement | Métrique | Cible |
|----|-------------|----------|-------|
| **NFR-001** | Temps de chargement initial de l'UI | First Contentful Paint | < 2s |
| **NFR-002** | Temps de réponse lecture contrat | Latence RPC | < 500ms |
| **NFR-003** | Temps de chargement metadata IPFS | Fetch time | < 3s |
| **NFR-004** | Gas cost pour mint | Gas units | < 200,000 |
| **NFR-005** | Gas cost pour échange | Gas units | < 300,000 |

### 2.2 Sécurité

| ID | Requirement | Type |
|----|-------------|------|
| **NFR-010** | Les contrats doivent être protégés contre le reentrancy | Smart Contract |
| **NFR-011** | Les fonctions critiques doivent avoir des access controls appropriés | Smart Contract |
| **NFR-012** | Les clés privées ne doivent jamais être exposées côté client | Application |
| **NFR-013** | Le JWT Pinata doit être utilisé côté serveur uniquement (API route) | Application |
| **NFR-014** | Les inputs utilisateur doivent être validés avant envoi au contrat | Application |

### 2.3 Fiabilité

| ID | Requirement | Métrique |
|----|-------------|----------|
| **NFR-020** | L'application doit gérer gracieusement les erreurs de transaction | Error handling |
| **NFR-021** | L'application doit fonctionner même si un gateway IPFS est down | Fallback |
| **NFR-022** | Les transactions pending doivent être trackées et affichées | UX |

### 2.4 Testabilité

| ID | Requirement | Cible |
|----|-------------|-------|
| **NFR-030** | Couverture de tests des smart contracts | > 80% |
| **NFR-031** | Tests des happy paths pour toutes les fonctions critiques | 100% |
| **NFR-032** | Tests des reverts pour toutes les conditions d'erreur | 100% |
| **NFR-033** | Tests d'intégration frontend/contrat | Critiques |

### 2.5 Maintenabilité

| ID | Requirement |
|----|-------------|
| **NFR-040** | Le code Solidity doit suivre le style guide officiel |
| **NFR-041** | Le code TypeScript doit passer les règles ESLint sans warning |
| **NFR-042** | Les contrats doivent être documentés avec NatSpec |
| **NFR-043** | Le frontend doit utiliser des types TypeScript stricts |

---

## 3. Exigences Techniques

### 3.1 Smart Contracts

#### 3.1.1 Structure des données

```solidity
// CardMeta - Stockage on-chain pour chaque carte
struct CardMeta {
    uint256 createdAt;        // Timestamp de création
    uint256 lastTransferAt;   // Timestamp du dernier transfert
    uint256 lockUntil;        // Timestamp de fin de lock
    uint256 pokemonId;        // ID PokeAPI (1-151)
    uint8 rarityTier;         // 1=Common, 2=Uncommon, 3=Rare, 4=Legendary
    uint256 value;            // HP + Attack + Defense
}

// Offer - Stockage on-chain pour chaque offre
struct Offer {
    address maker;            // Créateur de l'offre
    uint256 makerTokenId;     // Token proposé
    uint256 takerTokenId;     // Token demandé
    OfferStatus status;       // Open, Cancelled, Accepted
    uint256 createdAt;        // Timestamp de création
}

enum OfferStatus { Open, Cancelled, Accepted }
```

#### 3.1.2 Mappings requis

```solidity
// PokemonCards
mapping(uint256 => CardMeta) public cards;           // tokenId => metadata
mapping(uint256 => address[]) public previousOwners; // tokenId => owners history
mapping(address => uint256) public ownedCount;       // address => nombre de cartes

// TradeMarket
mapping(uint256 => Offer) public offers;             // offerId => offer data
mapping(address => uint256) public lastActionAt;     // address => last action timestamp
```

#### 3.1.3 Events requis

```solidity
// PokemonCards
event CardMinted(address indexed owner, uint256 indexed tokenId, uint256 pokemonId, uint8 rarityTier);
event CardTransferred(uint256 indexed tokenId, address indexed from, address indexed to);

// TradeMarket
event TradeCreated(uint256 indexed offerId, address indexed maker, uint256 makerTokenId, uint256 takerTokenId);
event TradeAccepted(uint256 indexed offerId, address indexed taker, address indexed maker);
event TradeCancelled(uint256 indexed offerId);
```

#### 3.1.4 Fonctions publiques

```solidity
// PokemonCards
function mint(uint256 pokemonId, uint8 rarityTier, uint256 value, string calldata tokenURI) external returns (uint256);
function getCardMeta(uint256 tokenId) external view returns (CardMeta memory);
function getPreviousOwners(uint256 tokenId) external view returns (address[] memory);
function isLocked(uint256 tokenId) external view returns (bool);
function getOwnedCount(address owner) external view returns (uint256);

// TradeMarket
function createOffer(uint256 makerTokenId, uint256 takerTokenId) external returns (uint256);
function cancelOffer(uint256 offerId) external;
function acceptOffer(uint256 offerId) external;
function getOffer(uint256 offerId) external view returns (Offer memory);
function getCooldownRemaining(address user) external view returns (uint256);
```

### 3.2 Frontend

#### 3.2.1 Pages requises

| Route | Composants principaux | Fonctionnalités |
|-------|----------------------|-----------------|
| `/` | `WalletConnect`, `Hero` | Connexion wallet, présentation |
| `/catalog` | `PokemonGrid`, `MintButton` | Liste Pokémon, action mint |
| `/inventory` | `CardGrid`, `CardDetail` | Mes cartes, détails, lock status |
| `/trade` | `CreateOfferForm`, `OfferList`, `AcceptButton` | Création/acceptation offres |
| `/history` | `EventList`, `Filters` | Historique transactions |

#### 3.2.2 Hooks personnalisés requis

```typescript
// Lecture PokeAPI
usePokemonList(): { data: Pokemon[], isLoading, error }
usePokemon(id: number): { data: Pokemon, isLoading, error }

// Lecture contrat
useOwnedCards(address: string): { data: Card[], isLoading, error }
useCardMeta(tokenId: bigint): { data: CardMeta, isLoading, error }
useOpenOffers(): { data: Offer[], isLoading, error }
useCooldownRemaining(address: string): { data: number, isLoading }

// Écriture contrat
useMintCard(): { mint: (pokemon: Pokemon) => Promise<void>, isPending, error }
useCreateOffer(): { create: (makerTokenId, takerTokenId) => Promise<void>, isPending, error }
useAcceptOffer(): { accept: (offerId) => Promise<void>, isPending, error }
useCancelOffer(): { cancel: (offerId) => Promise<void>, isPending, error }

// IPFS
usePinImage(): { pin: (imageUrl: string) => Promise<string>, isPending }
usePinMetadata(): { pin: (metadata: object) => Promise<string>, isPending }
useFetchMetadata(uri: string): { data: Metadata, isLoading, error }
```

#### 3.2.3 State management

```typescript
// wagmi gère le state blockchain via @tanstack/react-query
// État local minimal avec React useState/useReducer

// Contexte global (si nécessaire)
interface AppContext {
  selectedCard: Card | null;
  setSelectedCard: (card: Card | null) => void;
  notifications: Notification[];
  addNotification: (n: Notification) => void;
}
```

### 3.3 IPFS / Pinata

#### 3.3.1 API Routes (Next.js)

```typescript
// app/api/pin/image/route.ts
POST /api/pin/image
Body: { imageUrl: string }
Response: { cid: string }

// app/api/pin/metadata/route.ts
POST /api/pin/metadata
Body: { metadata: CardMetadata }
Response: { cid: string }
```

#### 3.3.2 Format Metadata

```typescript
interface CardMetadata {
  // Standard NFT
  name: string;                    // "Pikachu #25"
  description: string;             // "A Pokémon trading card"
  image: string;                   // "ipfs://Qm..."
  external_url?: string;           // PokeAPI URL

  // Attributes (OpenSea compatible)
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: "number" | "boost_percentage" | "date";
  }>;

  // Custom properties
  properties: {
    pokemonId: number;
    rarityTier: number;
    value: number;
    createdAt: number;
    lastTransferAt: number;
    previousOwners: string[];
  };
}
```

---

## 4. Contraintes Techniques

### 4.1 Blockchain

| Contrainte | Valeur | Justification |
|------------|--------|---------------|
| Solidity version | 0.8.20 | Dernière stable, PUSH0 support |
| EVM target | Paris | Sepolia compatibility |
| Max gas per tx | 500,000 | Limite raisonnable testnet |
| Block time assumption | 12s | Ethereum PoS |

### 4.2 Frontend

| Contrainte | Valeur | Justification |
|------------|--------|---------------|
| Node.js version | >= 18.17 | Next.js 14 requirement |
| Browser support | Chrome, Firefox, Edge (latest 2) | MetaMask support |
| Mobile support | Non requis (MVP) | Scope limitation |

### 4.3 IPFS

| Contrainte | Valeur | Justification |
|------------|--------|---------------|
| Max file size | 10MB | Pinata free tier |
| Max pins | 500 | Pinata free tier |
| Gateway timeout | 10s | UX acceptable |

---

## 5. Interfaces Externes

### 5.1 PokeAPI

**Base URL:** `https://pokeapi.co/api/v2`

**Endpoints utilisés:**
| Endpoint | Méthode | Usage |
|----------|---------|-------|
| `/pokemon/{id}` | GET | Détails d'un Pokémon |
| `/pokemon?limit=151` | GET | Liste des 151 premiers |

**Rate limiting:** 100 requêtes/minute (pas d'auth)

**Données extraites:**
- `id`, `name`, `types[]`, `stats[]`, `sprites`, `base_experience`

### 5.2 Pinata

**Base URL:** `https://api.pinata.cloud`

**Endpoints utilisés:**
| Endpoint | Méthode | Auth | Usage |
|----------|---------|------|-------|
| `/pinning/pinFileToIPFS` | POST | JWT | Pin image |
| `/pinning/pinJSONToIPFS` | POST | JWT | Pin metadata |

**Headers requis:**
```
Authorization: Bearer {JWT}
Content-Type: multipart/form-data (file) | application/json (JSON)
```

### 5.3 QuickNode RPC

**Méthodes JSON-RPC utilisées:**
| Méthode | Usage |
|---------|-------|
| `eth_call` | Lecture contrat |
| `eth_sendRawTransaction` | Envoi transaction |
| `eth_getTransactionReceipt` | Confirmation |
| `eth_getLogs` | Query events |
| `eth_blockNumber` | Block actuel |

---

## 6. Définition of Done (DoD)

### 6.1 Smart Contract

- [ ] Code compile sans warning
- [ ] Tests unitaires passent (> 80% coverage)
- [ ] Tests des reverts pour chaque condition d'erreur
- [ ] Documentation NatSpec complète
- [ ] Déployé sur Hardhat local
- [ ] Déployé sur Sepolia (optionnel)

### 6.2 Frontend Feature

- [ ] Composant implémenté selon les specs
- [ ] Types TypeScript complets
- [ ] Gestion des états loading/error
- [ ] Responsive (desktop)
- [ ] Testé manuellement sur Hardhat local

### 6.3 User Story

- [ ] Tous les critères d'acceptation validés
- [ ] Tests end-to-end (manual)
- [ ] Documentation mise à jour si nécessaire
- [ ] Code review passée

---

## 7. Risques Techniques

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Rate limit PokeAPI | Moyenne | Moyen | Cache local, requêtes groupées |
| Pinata down | Faible | Élevé | Gateways IPFS fallback |
| Gas price spike | Moyenne | Moyen | Estimation gas UI, testnet only |
| MetaMask rejection | Faible | Faible | Messages d'erreur clairs |
| IPFS propagation lente | Moyenne | Moyen | Dedicated gateway Pinata |
