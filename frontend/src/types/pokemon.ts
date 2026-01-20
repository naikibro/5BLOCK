/**
 * Types pour les données Pokémon
 * Source: PokeAPI (https://pokeapi.co)
 */

// Réponse brute de PokeAPI
export interface PokeAPIPokemon {
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
export interface Pokemon {
  id: number;
  name: string;
  displayName: string; // Capitalized
  types: string[]; // ["electric"]
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  image: string; // Official artwork URL
  sprite: string; // Small sprite URL
  height: number; // In decimeters
  weight: number; // In hectograms
  baseExperience: number;
  // Calculated fields
  value: number; // hp + attack + defense
  rarityTier: RarityTier;
  rarityName: RarityName;
}

export type RarityTier = 1 | 2 | 3 | 4;

export type RarityName = 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY';

/**
 * Calcule le tier de rareté basé sur la valeur (HP+ATK+DEF)
 * Tier 1 (COMMON): < 150
 * Tier 2 (UNCOMMON): 150-199
 * Tier 3 (RARE): 200-249
 * Tier 4 (LEGENDARY): >= 250
 */
export function calculateRarityTier(value: number): RarityTier {
  if (value >= 250) return 4;
  if (value >= 200) return 3;
  if (value >= 150) return 2;
  return 1;
}

/**
 * Retourne le nom de la rareté pour un tier donné
 */
export function getRarityName(tier: RarityTier): RarityName {
  const names: Record<RarityTier, RarityName> = {
    1: 'COMMON',
    2: 'UNCOMMON',
    3: 'RARE',
    4: 'LEGENDARY',
  };
  return names[tier];
}

/**
 * Metadata NFT standard pour les cartes Pokemon
 * Compatible avec OpenSea et autres marketplaces NFT
 */
export interface CardMetadata {
  // Standard NFT
  name: string; // "Pikachu #25"
  description: string; // Description du Pokemon
  image: string; // "ipfs://Qm..." - Image IPFS
  external_url?: string; // URL PokeAPI
  
  // Attributes (OpenSea compatible)
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: 'number' | 'boost_percentage' | 'date';
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

/**
 * Interface pour une carte possédée (combinaison on-chain + IPFS)
 */
export interface OwnedCard {
  tokenId: bigint;
  // On-chain data
  pokemonId: number;
  rarityTier: number;
  value: number;
  createdAt: number;
  lastTransferAt: number;
  lockUntil: number;
  // Computed
  isLocked: boolean;
  lockRemaining: number;
  // IPFS metadata
  metadata: CardMetadata | null;
}
