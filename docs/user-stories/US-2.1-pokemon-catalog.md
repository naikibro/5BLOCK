# US-2.1: Consulter le Catalogue Pokémon

> **Epic:** Gestion des Cartes (Tokens)
> **Priorité:** Must Have
> **Complexité:** Moyenne

---

## Description

**En tant qu'** utilisateur,
**Je veux** voir la liste des Pokémon disponibles à minter,
**Afin de** choisir quelle carte je souhaite obtenir.

---

## Contexte & Justification

Le catalogue est la vitrine de la DApp. Il présente tous les Pokémon de la première génération (1-151) avec leurs caractéristiques. L'utilisateur peut parcourir ce catalogue pour :

- **Découvrir** les Pokémon disponibles
- **Comparer** leurs stats et raretés
- **Choisir** lequel minter

Les données proviennent de **PokeAPI**, une API gratuite et complète sur les Pokémon.

---

## Critères d'acceptation

| ID | Critère | Vérifié |
|----|---------|---------|
| AC-2.1.1 | La page `/catalog` affiche les Pokémon #1 à #151 (Gen 1) | [ ] |
| AC-2.1.2 | Chaque Pokémon affiche : image, nom, type(s), stats de base (HP, ATK, DEF) | [ ] |
| AC-2.1.3 | Un indicateur de rareté est calculé et affiché (Common/Uncommon/Rare/Legendary) | [ ] |
| AC-2.1.4 | La valeur calculée (HP+ATK+DEF) est affichée | [ ] |
| AC-2.1.5 | Les données proviennent de PokeAPI et sont mises en cache | [ ] |
| AC-2.1.6 | Un skeleton loader s'affiche pendant le chargement | [ ] |
| AC-2.1.7 | Pagination ou infinite scroll pour gérer les 151 entrées | [ ] |
| AC-2.1.8 | Filtrage par type (Fire, Water, etc.) disponible | [ ] |
| AC-2.1.9 | Recherche par nom disponible | [ ] |
| AC-2.1.10 | Bouton "Mint" visible sur chaque carte (lié à US-2.2) | [ ] |

---

## Règles métier

### Calcul de la rareté

La rareté est déterminée par la somme HP + Attack + Defense :

| Tier | Nom | Score (HP+ATK+DEF) | Couleur Badge |
|------|-----|-------------------|---------------|
| 1 | COMMON | < 150 | Gris |
| 2 | UNCOMMON | 150 - 199 | Vert |
| 3 | RARE | 200 - 249 | Bleu |
| 4 | LEGENDARY | >= 250 | Or/Jaune |

### Calcul de la valeur

```
value = HP + Attack + Defense
```

### Types Pokémon

18 types possibles : Normal, Fire, Water, Electric, Grass, Ice, Fighting, Poison, Ground, Flying, Psychic, Bug, Rock, Ghost, Dragon, Dark, Steel, Fairy.

---

## Spécifications techniques

### API PokeAPI

**Base URL:** `https://pokeapi.co/api/v2`

**Endpoints:**
```
GET /pokemon?limit=151                    # Liste des 151 premiers
GET /pokemon/{id}                         # Détails d'un Pokémon
GET /pokemon-species/{id}                 # Infos supplémentaires (description)
```

**Exemple de réponse `/pokemon/25` (Pikachu):**
```json
{
  "id": 25,
  "name": "pikachu",
  "types": [
    { "slot": 1, "type": { "name": "electric" } }
  ],
  "stats": [
    { "base_stat": 35, "stat": { "name": "hp" } },
    { "base_stat": 55, "stat": { "name": "attack" } },
    { "base_stat": 40, "stat": { "name": "defense" } },
    { "base_stat": 50, "stat": { "name": "special-attack" } },
    { "base_stat": 50, "stat": { "name": "special-defense" } },
    { "base_stat": 90, "stat": { "name": "speed" } }
  ],
  "sprites": {
    "front_default": "https://raw.githubusercontent.com/.../25.png",
    "other": {
      "official-artwork": {
        "front_default": "https://raw.githubusercontent.com/.../25.png"
      }
    }
  },
  "height": 4,
  "weight": 60,
  "base_experience": 112
}
```

### Modèles de données

```typescript
// types/pokemon.ts

// Réponse brute de PokeAPI
interface PokeAPIPokemon {
  id: number;
  name: string;
  types: Array<{
    slot: number;
    type: { name: string };
  }>;
  stats: Array<{
    base_stat: number;
    stat: { name: string };
  }>;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  height: number;
  weight: number;
  base_experience: number;
}

// Modèle transformé pour l'application
interface Pokemon {
  id: number;
  name: string;
  displayName: string;        // Capitalized
  types: string[];            // ["electric"]
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  image: string;              // Official artwork URL
  sprite: string;             // Small sprite URL
  height: number;             // In decimeters
  weight: number;             // In hectograms
  baseExperience: number;
  // Calculated fields
  value: number;              // hp + attack + defense
  rarityTier: RarityTier;
  rarityName: string;
}

type RarityTier = 1 | 2 | 3 | 4;
type RarityName = 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY';
```

### Service PokeAPI

```typescript
// lib/pokeapi.ts
const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

// Fetch single Pokemon
export async function fetchPokemon(id: number): Promise<Pokemon> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}`);
  if (!response.ok) throw new Error(`Pokemon ${id} not found`);

  const data: PokeAPIPokemon = await response.json();
  return transformPokemon(data);
}

// Fetch all Gen 1 Pokemon (with caching)
export async function fetchAllPokemon(): Promise<Pokemon[]> {
  const promises = Array.from({ length: 151 }, (_, i) => fetchPokemon(i + 1));
  return Promise.all(promises);
}

// Transform PokeAPI response to our model
function transformPokemon(data: PokeAPIPokemon): Pokemon {
  const stats = {
    hp: getStatValue(data.stats, 'hp'),
    attack: getStatValue(data.stats, 'attack'),
    defense: getStatValue(data.stats, 'defense'),
    specialAttack: getStatValue(data.stats, 'special-attack'),
    specialDefense: getStatValue(data.stats, 'special-defense'),
    speed: getStatValue(data.stats, 'speed'),
  };

  const value = stats.hp + stats.attack + stats.defense;
  const rarityTier = calculateRarityTier(value);

  return {
    id: data.id,
    name: data.name,
    displayName: capitalize(data.name),
    types: data.types.map(t => t.type.name),
    stats,
    image: data.sprites.other['official-artwork'].front_default,
    sprite: data.sprites.front_default,
    height: data.height,
    weight: data.weight,
    baseExperience: data.base_experience,
    value,
    rarityTier,
    rarityName: getRarityName(rarityTier),
  };
}

function getStatValue(stats: PokeAPIPokemon['stats'], name: string): number {
  return stats.find(s => s.stat.name === name)?.base_stat ?? 0;
}

function calculateRarityTier(value: number): RarityTier {
  if (value >= 250) return 4;
  if (value >= 200) return 3;
  if (value >= 150) return 2;
  return 1;
}

function getRarityName(tier: RarityTier): RarityName {
  const names: Record<RarityTier, RarityName> = {
    1: 'COMMON',
    2: 'UNCOMMON',
    3: 'RARE',
    4: 'LEGENDARY',
  };
  return names[tier];
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

### Hook React Query

```typescript
// hooks/usePokemon.ts
import { useQuery } from '@tanstack/react-query';
import { fetchPokemon, fetchAllPokemon } from '@/lib/pokeapi';

// Single Pokemon
export function usePokemon(id: number) {
  return useQuery({
    queryKey: ['pokemon', id],
    queryFn: () => fetchPokemon(id),
    staleTime: Infinity, // Pokemon data never changes
  });
}

// All Pokemon (for catalog)
export function usePokemonList() {
  return useQuery({
    queryKey: ['pokemon', 'list'],
    queryFn: fetchAllPokemon,
    staleTime: Infinity,
  });
}

// Filtered Pokemon
export function useFilteredPokemon(
  filters: { type?: string; search?: string }
) {
  const { data: allPokemon, ...rest } = usePokemonList();

  const filtered = allPokemon?.filter(pokemon => {
    // Type filter
    if (filters.type && !pokemon.types.includes(filters.type)) {
      return false;
    }
    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!pokemon.name.includes(search) && !pokemon.id.toString().includes(search)) {
        return false;
      }
    }
    return true;
  });

  return { data: filtered, ...rest };
}
```

### Composant PokemonCard

```typescript
// components/PokemonCard.tsx
'use client';

import Image from 'next/image';
import { Pokemon } from '@/types/pokemon';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TypeBadge } from './TypeBadge';
import { RarityBadge } from './RarityBadge';

interface PokemonCardProps {
  pokemon: Pokemon;
  onMint?: (pokemon: Pokemon) => void;
  disabled?: boolean;
}

export function PokemonCard({ pokemon, onMint, disabled }: PokemonCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
        <Image
          src={pokemon.image}
          alt={pokemon.displayName}
          fill
          className="object-contain p-4"
        />
        <RarityBadge
          tier={pokemon.rarityTier}
          className="absolute top-2 right-2"
        />
      </div>

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">{pokemon.displayName}</h3>
          <span className="text-sm text-muted-foreground">#{pokemon.id}</span>
        </div>

        <div className="flex gap-1 mb-3">
          {pokemon.types.map(type => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <StatDisplay label="HP" value={pokemon.stats.hp} />
          <StatDisplay label="ATK" value={pokemon.stats.attack} />
          <StatDisplay label="DEF" value={pokemon.stats.defense} />
        </div>

        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Value</span>
            <span className="font-semibold">{pokemon.value}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={() => onMint?.(pokemon)}
          disabled={disabled}
        >
          Mint Card
        </Button>
      </CardFooter>
    </Card>
  );
}

function StatDisplay({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
```

### Composant TypeBadge

```typescript
// components/TypeBadge.tsx
import { Badge } from '@/components/ui/badge';

const TYPE_COLORS: Record<string, string> = {
  normal: 'bg-gray-400',
  fire: 'bg-orange-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-cyan-300',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-amber-600',
  flying: 'bg-indigo-300',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-500',
  rock: 'bg-stone-500',
  ghost: 'bg-purple-700',
  dragon: 'bg-violet-600',
  dark: 'bg-gray-700',
  steel: 'bg-slate-400',
  fairy: 'bg-pink-300',
};

export function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? 'bg-gray-500';

  return (
    <Badge className={`${color} text-white capitalize`}>
      {type}
    </Badge>
  );
}
```

### Composant RarityBadge

```typescript
// components/RarityBadge.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const RARITY_STYLES: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Common' },
  2: { bg: 'bg-green-200', text: 'text-green-700', label: 'Uncommon' },
  3: { bg: 'bg-blue-200', text: 'text-blue-700', label: 'Rare' },
  4: { bg: 'bg-yellow-200', text: 'text-yellow-700', label: 'Legendary' },
};

interface RarityBadgeProps {
  tier: number;
  className?: string;
}

export function RarityBadge({ tier, className }: RarityBadgeProps) {
  const style = RARITY_STYLES[tier] ?? RARITY_STYLES[1];

  return (
    <Badge className={cn(style.bg, style.text, className)}>
      {style.label}
    </Badge>
  );
}
```

### Page Catalog

```typescript
// app/catalog/page.tsx
'use client';

import { useState } from 'react';
import { useFilteredPokemon } from '@/hooks/usePokemon';
import { PokemonCard } from '@/components/PokemonCard';
import { PokemonCardSkeleton } from '@/components/PokemonCardSkeleton';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const TYPES = [
  'all', 'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: pokemon, isLoading, error } = useFilteredPokemon({
    type: typeFilter === 'all' ? undefined : typeFilter,
    search: search || undefined,
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Pokémon Catalog</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search by name or number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={typeFilter}
          onValueChange={setTypeFilter}
        >
          {TYPES.map(type => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Types' : type}
            </option>
          ))}
        </Select>
      </div>

      {/* Results count */}
      {pokemon && (
        <p className="text-muted-foreground mb-4">
          Showing {pokemon.length} Pokémon
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {isLoading && (
          Array.from({ length: 20 }).map((_, i) => (
            <PokemonCardSkeleton key={i} />
          ))
        )}

        {pokemon?.map(p => (
          <PokemonCard
            key={p.id}
            pokemon={p}
            onMint={(pokemon) => console.log('Mint', pokemon)}
          />
        ))}
      </div>

      {/* Empty state */}
      {pokemon?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No Pokémon found matching your criteria.</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">Error loading Pokémon. Please try again.</p>
        </div>
      )}
    </div>
  );
}
```

---

## Interface utilisateur

### Layout de la page

```
┌─────────────────────────────────────────────────────────────┐
│  Pokémon Catalog                                            │
├─────────────────────────────────────────────────────────────┤
│  [Search...______]  [Type: All ▼]       Showing 151 Pokémon │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ [img]   │  │ [img]   │  │ [img]   │  │ [img]   │        │
│  │ Bulba.. │  │ Ivy...  │  │ Venu... │  │ Charm.. │        │
│  │ 🌿Grass │  │ 🌿Grass │  │ 🌿Grass │  │ 🔥Fire  │        │
│  │ HP:45   │  │ HP:60   │  │ HP:80   │  │ HP:39   │        │
│  │ [Mint]  │  │ [Mint]  │  │ [Mint]  │  │ [Mint]  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│  ...                                                        │
└─────────────────────────────────────────────────────────────┘
```

### Wireframe d'une carte

```
┌────────────────────┐
│  [Legendary]    #25│
│                    │
│      ⚡            │
│     (•◡•)         │
│    Pikachu         │
│                    │
├────────────────────┤
│  Pikachu           │
│  [Electric]        │
│                    │
│  HP   ATK   DEF    │
│  35   55    40     │
│                    │
│  Value: 130        │
├────────────────────┤
│  [    Mint    ]    │
└────────────────────┘
```

---

## Scénarios de test

| # | Scénario | Étapes | Résultat attendu |
|---|----------|--------|------------------|
| 1 | Chargement initial | 1. Aller sur /catalog | 151 Pokémon affichés |
| 2 | Recherche par nom | 1. Taper "pikachu" | Seul Pikachu affiché |
| 3 | Recherche par numéro | 1. Taper "25" | Pikachu affiché |
| 4 | Filtre par type | 1. Sélectionner "Fire" | Charmander, Vulpix, etc. |
| 5 | Combinaison filtres | 1. Type=Water 2. Search="s" | Squirtle, Staryu, etc. |
| 6 | Aucun résultat | 1. Search="xyz" | Message "No Pokémon found" |
| 7 | Loading state | 1. Recharger la page | Skeletons puis cartes |
| 8 | Vérifier rareté | 1. Trouver un Legendary | Badge doré sur les plus forts |

---

## Performance & Optimisation

### Stratégie de cache

- **staleTime: Infinity** : Les données Pokémon ne changent jamais
- **Prefetch** : Possibilité de prefetch au hover pour les détails
- **Image optimization** : Utiliser Next.js Image avec lazy loading

### Pagination (optionnel)

Si les 151 cartes causent des problèmes de performance :

```typescript
// Option 1: Pagination classique
const PAGE_SIZE = 20;
const [page, setPage] = useState(1);
const paginatedPokemon = pokemon?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

// Option 2: Infinite scroll avec react-intersection-observer
import { useInView } from 'react-intersection-observer';
```

---

## Dépendances

### Dépendances techniques
- `@tanstack/react-query` pour le cache
- `next/image` pour l'optimisation images

### Dépendances fonctionnelles
- Aucune (page consultable sans connexion wallet)

### Bloque
- US-2.2 (Mint) - le bouton Mint sur les cartes

---

## Définition of Done

- [ ] Service PokeAPI avec transformation des données
- [ ] Hook `usePokemonList` avec cache
- [ ] Composant `PokemonCard` avec tous les éléments
- [ ] Composants `TypeBadge` et `RarityBadge`
- [ ] Page `/catalog` avec grille responsive
- [ ] Filtres par type et recherche fonctionnels
- [ ] Loading states (skeletons)
- [ ] Tests manuels passés
