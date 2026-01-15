# US-5.1: Stockage IPFS (Images & Métadonnées)

> **Epic:** IPFS & Métadonnées
> **Priorité:** Must Have
> **Complexité:** Moyenne

---

## Description

**En tant que** système,
**Je dois** stocker les images et métadonnées des cartes sur IPFS via Pinata,
**Afin de** garantir leur disponibilité décentralisée et leur intégrité.

---

## Critères d'acceptation

| ID | Critère | Vérifié |
|----|---------|---------|
| AC-5.1.1 | Les images des Pokémon sont téléchargées depuis PokeAPI | [ ] |
| AC-5.1.2 | Les images sont pinnées sur IPFS via Pinata | [ ] |
| AC-5.1.3 | Un CID unique est retourné pour chaque image | [ ] |
| AC-5.1.4 | Les métadonnées JSON sont générées au format NFT standard | [ ] |
| AC-5.1.5 | Les métadonnées incluent le CID de l'image | [ ] |
| AC-5.1.6 | Les métadonnées sont pinnées sur IPFS via Pinata | [ ] |
| AC-5.1.7 | Le `tokenURI` stocké on-chain pointe vers le CID des métadonnées | [ ] |
| AC-5.1.8 | L'UI peut lire les métadonnées depuis IPFS via gateway | [ ] |

---

## Architecture IPFS

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    PokeAPI      │     │    Pinata       │     │   IPFS Network  │
│  (Image URL)    │────▶│  (Pin Service)  │────▶│   (Storage)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                        │
        ▼                       ▼                        ▼
   Download             CID returned              Content available
   image                QmXxx...                  via gateways
```

---

## Format des métadonnées

### NFT Metadata Standard (ERC-721)

```json
{
  "name": "Pikachu #25",
  "description": "A Rare Pokémon trading card. Pikachu is an Electric type Pokémon.",
  "image": "ipfs://QmImageCID123...",
  "external_url": "https://pokeapi.co/api/v2/pokemon/25",
  "attributes": [
    { "trait_type": "Type", "value": "Electric" },
    { "trait_type": "HP", "value": 35, "display_type": "number" },
    { "trait_type": "Attack", "value": 55, "display_type": "number" },
    { "trait_type": "Defense", "value": 40, "display_type": "number" },
    { "trait_type": "Speed", "value": 90, "display_type": "number" },
    { "trait_type": "Rarity", "value": "Rare" },
    { "trait_type": "Value", "value": 130, "display_type": "number" },
    { "trait_type": "Generation", "value": 1, "display_type": "number" }
  ],
  "properties": {
    "pokemonId": 25,
    "rarityTier": 3,
    "value": 130,
    "createdAt": 1705312800,
    "lastTransferAt": 1705312800,
    "previousOwners": []
  }
}
```

---

## Spécifications techniques

### API Routes Next.js

```typescript
// app/api/pin/image/route.ts
import { NextRequest, NextResponse } from 'next/server';

const PINATA_JWT = process.env.PINATA_JWT!;

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, pokemonId } = await request.json();

    // Download image from PokeAPI
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download image');
    }

    const imageBlob = await imageResponse.blob();

    // Prepare form data for Pinata
    const formData = new FormData();
    formData.append('file', imageBlob, `pokemon-${pokemonId}.png`);
    formData.append('pinataMetadata', JSON.stringify({
      name: `Pokemon #${pokemonId} Image`,
    }));
    formData.append('pinataOptions', JSON.stringify({
      cidVersion: 1,
    }));

    // Pin to Pinata
    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!pinataResponse.ok) {
      const error = await pinataResponse.text();
      throw new Error(`Pinata error: ${error}`);
    }

    const { IpfsHash } = await pinataResponse.json();

    return NextResponse.json({
      success: true,
      cid: IpfsHash,
      uri: `ipfs://${IpfsHash}`,
    });

  } catch (error) {
    console.error('Pin image error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/pin/metadata/route.ts
import { NextRequest, NextResponse } from 'next/server';

const PINATA_JWT = process.env.PINATA_JWT!;

export async function POST(request: NextRequest) {
  try {
    const metadata = await request.json();

    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: metadata.name || 'Pokemon Card Metadata',
        },
        pinataOptions: {
          cidVersion: 1,
        },
      }),
    });

    if (!pinataResponse.ok) {
      const error = await pinataResponse.text();
      throw new Error(`Pinata error: ${error}`);
    }

    const { IpfsHash } = await pinataResponse.json();

    return NextResponse.json({
      success: true,
      cid: IpfsHash,
      uri: `ipfs://${IpfsHash}`,
    });

  } catch (error) {
    console.error('Pin metadata error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
```

### Service IPFS Client

```typescript
// lib/ipfs.ts

const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
];

export async function pinImage(imageUrl: string, pokemonId: number): Promise<string> {
  const response = await fetch('/api/pin/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, pokemonId }),
  });

  if (!response.ok) {
    throw new Error('Failed to pin image');
  }

  const { cid } = await response.json();
  return cid;
}

export async function pinMetadata(metadata: CardMetadata): Promise<string> {
  const response = await fetch('/api/pin/metadata', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    throw new Error('Failed to pin metadata');
  }

  const { cid } = await response.json();
  return cid;
}

export async function fetchFromIPFS<T>(uri: string): Promise<T> {
  const cid = uri.replace('ipfs://', '');

  for (const gateway of IPFS_GATEWAYS) {
    try {
      const response = await fetch(`${gateway}${cid}`, {
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn(`Gateway ${gateway} failed, trying next...`);
    }
  }

  throw new Error(`Failed to fetch from IPFS: ${cid}`);
}

export function ipfsToHttp(uri: string, gateway = IPFS_GATEWAYS[0]): string {
  if (!uri.startsWith('ipfs://')) return uri;
  return uri.replace('ipfs://', gateway);
}
```

### Metadata Builder

```typescript
// lib/metadata.ts
import { Pokemon } from '@/types/pokemon';

export interface CardMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  properties: {
    pokemonId: number;
    rarityTier: number;
    value: number;
    createdAt: number;
    lastTransferAt: number;
    previousOwners: string[];
  };
}

export function buildMetadata(
  pokemon: Pokemon,
  imageCID: string,
  owner?: string
): CardMetadata {
  const now = Math.floor(Date.now() / 1000);

  return {
    name: `${capitalize(pokemon.name)} #${pokemon.id}`,
    description: `A ${pokemon.rarityName} Pokémon trading card. ${capitalize(pokemon.name)} is a ${pokemon.types.join('/')} type Pokémon.`,
    image: `ipfs://${imageCID}`,
    external_url: `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`,
    attributes: [
      { trait_type: 'Type', value: capitalize(pokemon.types[0]) },
      { trait_type: 'HP', value: pokemon.stats.hp, display_type: 'number' },
      { trait_type: 'Attack', value: pokemon.stats.attack, display_type: 'number' },
      { trait_type: 'Defense', value: pokemon.stats.defense, display_type: 'number' },
      { trait_type: 'Speed', value: pokemon.stats.speed, display_type: 'number' },
      { trait_type: 'Rarity', value: pokemon.rarityName },
      { trait_type: 'Value', value: pokemon.value, display_type: 'number' },
      { trait_type: 'Generation', value: 1, display_type: 'number' },
    ],
    properties: {
      pokemonId: pokemon.id,
      rarityTier: pokemon.rarityTier,
      value: pokemon.value,
      createdAt: now,
      lastTransferAt: now,
      previousOwners: [],
    },
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

---

## Scénarios de test

| # | Scénario | Étapes | Résultat attendu |
|---|----------|--------|------------------|
| 1 | Pin image | 1. Appeler /api/pin/image avec URL PokeAPI | CID retourné |
| 2 | Pin metadata | 1. Appeler /api/pin/metadata avec JSON | CID retourné |
| 3 | Fetch via gateway | 1. Accéder à gateway.pinata.cloud/ipfs/{CID} | Contenu retourné |
| 4 | Fallback gateway | 1. Gateway principal down 2. Fetch | Fallback fonctionne |
| 5 | Invalid image URL | 1. Appeler avec URL invalide | Erreur 500 |

---

## Configuration requise

### Variables d'environnement

```env
# .env.local
PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
```

### Obtention du JWT Pinata

1. Créer un compte sur [pinata.cloud](https://pinata.cloud)
2. Aller dans API Keys
3. Créer une nouvelle clé avec permissions "pinFileToIPFS" et "pinJSONToIPFS"
4. Copier le JWT

---

## Limitations Pinata Free Tier

| Limite | Valeur |
|--------|--------|
| Pins | 500 fichiers |
| Storage | 1 GB |
| Gateway bandwidth | 100 GB/mois |
| API requests | Illimité |

---

## Définition of Done

- [ ] API route `/api/pin/image` fonctionnelle
- [ ] API route `/api/pin/metadata` fonctionnelle
- [ ] Service `ipfs.ts` avec pinning et fetching
- [ ] Builder de métadonnées au format standard
- [ ] Fallback sur plusieurs gateways
- [ ] Configuration Pinata documentée
- [ ] Tests manuels de pin + fetch
