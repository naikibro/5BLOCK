/**
 * Service PokeAPI
 * Gestion de la récupération et transformation des données Pokémon depuis PokeAPI
 */

import {
  PokeAPIPokemon,
  Pokemon,
  calculateRarityTier,
  getRarityName,
} from '@/types/pokemon';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

/**
 * Récupère un Pokémon par son ID depuis PokeAPI
 * @param id - ID du Pokémon (1-151 pour Gen 1)
 * @returns Pokémon transformé
 * @throws Error si le Pokémon n'est pas trouvé
 */
export async function fetchPokemon(id: number): Promise<Pokemon> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}`);
  
  if (!response.ok) {
    throw new Error(`Pokemon ${id} not found`);
  }

  const data: PokeAPIPokemon = await response.json();
  return transformPokemon(data);
}

/**
 * Récupère tous les Pokémon de Gen 1 (1-151)
 * @returns Array de tous les Pokémon de Gen 1
 */
export async function fetchAllPokemon(): Promise<Pokemon[]> {
  const promises = Array.from({ length: 151 }, (_, i) => fetchPokemon(i + 1));
  return Promise.all(promises);
}

/**
 * Transforme les données brutes de PokeAPI en modèle Pokemon de l'application
 * @param data - Données brutes de PokeAPI
 * @returns Pokemon transformé avec calculs de rareté et valeur
 */
export function transformPokemon(data: PokeAPIPokemon): Pokemon {
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
    types: data.types.map((t) => t.type.name),
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

/**
 * Extrait la valeur d'une stat spécifique depuis l'array de stats PokeAPI
 * @param stats - Array de stats de PokeAPI
 * @param name - Nom de la stat à extraire (hp, attack, defense, etc.)
 * @returns Valeur de la stat ou 0 si non trouvée
 */
export function getStatValue(
  stats: PokeAPIPokemon['stats'],
  name: string
): number {
  return stats.find((s) => s.stat.name === name)?.base_stat ?? 0;
}

/**
 * Capitalise la première lettre d'une chaîne
 * @param str - Chaîne à capitaliser
 * @returns Chaîne avec première lettre en majuscule
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
