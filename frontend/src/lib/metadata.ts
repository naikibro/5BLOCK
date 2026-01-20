/**
 * Construction des métadonnées NFT pour les cartes Pokemon
 * Format compatible avec le standard NFT et OpenSea
 */

import { Pokemon, CardMetadata } from '@/types/pokemon';

/**
 * Construit les métadonnées complètes pour une carte Pokemon
 * @param pokemon - Données Pokemon depuis PokeAPI
 * @param imageCID - CID IPFS de l'image uploadée
 * @returns Métadonnées au format NFT standard
 */
export function buildCardMetadata(
  pokemon: Pokemon,
  imageCID: string
): CardMetadata {
  const now = Math.floor(Date.now() / 1000);

  return {
    name: `${pokemon.displayName} #${pokemon.id}`,
    description: `A ${pokemon.rarityName} Pokémon trading card. ${pokemon.displayName} is a ${pokemon.types.join('/')} type Pokémon.`,
    image: `ipfs://${imageCID}`,
    external_url: `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`,
    attributes: [
      // Type principal
      {
        trait_type: 'Type',
        value: pokemon.types[0],
      },
      // Stats de combat
      {
        trait_type: 'HP',
        value: pokemon.stats.hp,
        display_type: 'number',
      },
      {
        trait_type: 'Attack',
        value: pokemon.stats.attack,
        display_type: 'number',
      },
      {
        trait_type: 'Defense',
        value: pokemon.stats.defense,
        display_type: 'number',
      },
      {
        trait_type: 'Speed',
        value: pokemon.stats.speed,
        display_type: 'number',
      },
      // Rareté et valeur
      {
        trait_type: 'Rarity',
        value: pokemon.rarityName,
      },
      {
        trait_type: 'Value',
        value: pokemon.value,
        display_type: 'number',
      },
      // Génération
      {
        trait_type: 'Generation',
        value: 1,
        display_type: 'number',
      },
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
