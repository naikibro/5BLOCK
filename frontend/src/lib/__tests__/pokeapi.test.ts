/**
 * Tests pour le service PokeAPI
 */

import {
  fetchPokemon,
  fetchAllPokemon,
  transformPokemon,
  getStatValue,
} from '../pokeapi';
import { PokeAPIPokemon } from '@/types/pokemon';

// Mock fetch globally
global.fetch = jest.fn();

describe('PokeAPI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchPokemon', () => {
    const mockPokeAPIResponse: PokeAPIPokemon = {
      id: 25,
      name: 'pikachu',
      types: [{ slot: 1, type: { name: 'electric' } }],
      stats: [
        { base_stat: 35, stat: { name: 'hp' } },
        { base_stat: 55, stat: { name: 'attack' } },
        { base_stat: 40, stat: { name: 'defense' } },
        { base_stat: 50, stat: { name: 'special-attack' } },
        { base_stat: 50, stat: { name: 'special-defense' } },
        { base_stat: 90, stat: { name: 'speed' } },
      ],
      sprites: {
        front_default: 'https://example.com/sprite.png',
        other: {
          'official-artwork': {
            front_default: 'https://example.com/artwork.png',
          },
        },
      },
      height: 4,
      weight: 60,
      base_experience: 112,
    };

    it('devrait récupérer et transformer un Pokémon par son ID', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokeAPIResponse,
      });

      const result = await fetchPokemon(25);

      expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/25');
      expect(result).toMatchObject({
        id: 25,
        name: 'pikachu',
        displayName: 'Pikachu',
        types: ['electric'],
        value: 130, // 35 + 55 + 40
        rarityTier: 1, // COMMON (< 150)
        rarityName: 'COMMON',
      });
    });

    it('devrait lancer une erreur si le Pokémon n\'existe pas', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(fetchPokemon(999)).rejects.toThrow('Pokemon 999 not found');
    });

    it('devrait lancer une erreur en cas d\'échec réseau', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchPokemon(1)).rejects.toThrow('Network error');
    });
  });

  describe('transformPokemon', () => {
    it('devrait transformer correctement les données PokeAPI', () => {
      const mockData: PokeAPIPokemon = {
        id: 1,
        name: 'bulbasaur',
        types: [
          { slot: 1, type: { name: 'grass' } },
          { slot: 2, type: { name: 'poison' } },
        ],
        stats: [
          { base_stat: 45, stat: { name: 'hp' } },
          { base_stat: 49, stat: { name: 'attack' } },
          { base_stat: 49, stat: { name: 'defense' } },
          { base_stat: 65, stat: { name: 'special-attack' } },
          { base_stat: 65, stat: { name: 'special-defense' } },
          { base_stat: 45, stat: { name: 'speed' } },
        ],
        sprites: {
          front_default: 'https://example.com/sprite.png',
          other: {
            'official-artwork': {
              front_default: 'https://example.com/artwork.png',
            },
          },
        },
        height: 7,
        weight: 69,
        base_experience: 64,
      };

      const result = transformPokemon(mockData);

      expect(result).toEqual({
        id: 1,
        name: 'bulbasaur',
        displayName: 'Bulbasaur',
        types: ['grass', 'poison'],
        stats: {
          hp: 45,
          attack: 49,
          defense: 49,
          specialAttack: 65,
          specialDefense: 65,
          speed: 45,
        },
        image: 'https://example.com/artwork.png',
        sprite: 'https://example.com/sprite.png',
        height: 7,
        weight: 69,
        baseExperience: 64,
        value: 143, // 45 + 49 + 49
        rarityTier: 1, // COMMON (< 150)
        rarityName: 'COMMON',
      });
    });

    it('devrait calculer correctement la rareté UNCOMMON', () => {
      const mockData: PokeAPIPokemon = {
        id: 6,
        name: 'charizard',
        types: [{ slot: 1, type: { name: 'fire' } }],
        stats: [
          { base_stat: 78, stat: { name: 'hp' } },
          { base_stat: 84, stat: { name: 'attack' } },
          { base_stat: 78, stat: { name: 'defense' } },
          { base_stat: 109, stat: { name: 'special-attack' } },
          { base_stat: 85, stat: { name: 'special-defense' } },
          { base_stat: 100, stat: { name: 'speed' } },
        ],
        sprites: {
          front_default: 'sprite',
          other: { 'official-artwork': { front_default: 'artwork' } },
        },
        height: 17,
        weight: 905,
        base_experience: 240,
      };

      const result = transformPokemon(mockData);

      expect(result.value).toBe(240); // 78 + 84 + 78
      expect(result.rarityTier).toBe(3); // RARE (200-249)
      expect(result.rarityName).toBe('RARE');
    });

    it('devrait calculer correctement la rareté LEGENDARY', () => {
      const mockData: PokeAPIPokemon = {
        id: 150,
        name: 'mewtwo',
        types: [{ slot: 1, type: { name: 'psychic' } }],
        stats: [
          { base_stat: 106, stat: { name: 'hp' } },
          { base_stat: 110, stat: { name: 'attack' } },
          { base_stat: 90, stat: { name: 'defense' } },
          { base_stat: 154, stat: { name: 'special-attack' } },
          { base_stat: 90, stat: { name: 'special-defense' } },
          { base_stat: 130, stat: { name: 'speed' } },
        ],
        sprites: {
          front_default: 'sprite',
          other: { 'official-artwork': { front_default: 'artwork' } },
        },
        height: 20,
        weight: 1220,
        base_experience: 306,
      };

      const result = transformPokemon(mockData);

      expect(result.value).toBe(306); // 106 + 110 + 90
      expect(result.rarityTier).toBe(4); // LEGENDARY (>= 250)
      expect(result.rarityName).toBe('LEGENDARY');
    });
  });

  describe('getStatValue', () => {
    const stats = [
      { base_stat: 45, stat: { name: 'hp' } },
      { base_stat: 49, stat: { name: 'attack' } },
      { base_stat: 49, stat: { name: 'defense' } },
    ];

    it('devrait retourner la valeur correcte pour une stat existante', () => {
      expect(getStatValue(stats, 'hp')).toBe(45);
      expect(getStatValue(stats, 'attack')).toBe(49);
      expect(getStatValue(stats, 'defense')).toBe(49);
    });

    it('devrait retourner 0 pour une stat inexistante', () => {
      expect(getStatValue(stats, 'nonexistent')).toBe(0);
    });
  });

  describe('fetchAllPokemon', () => {
    it('devrait récupérer tous les 151 Pokémon de Gen 1', async () => {
      // Mock fetch pour retourner des Pokémon simples
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        const id = parseInt(url.split('/').pop() || '1');
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id,
            name: `pokemon${id}`,
            types: [{ slot: 1, type: { name: 'normal' } }],
            stats: [
              { base_stat: 50, stat: { name: 'hp' } },
              { base_stat: 50, stat: { name: 'attack' } },
              { base_stat: 50, stat: { name: 'defense' } },
              { base_stat: 50, stat: { name: 'special-attack' } },
              { base_stat: 50, stat: { name: 'special-defense' } },
              { base_stat: 50, stat: { name: 'speed' } },
            ],
            sprites: {
              front_default: `sprite${id}`,
              other: { 'official-artwork': { front_default: `artwork${id}` } },
            },
            height: 10,
            weight: 100,
            base_experience: 100,
          }),
        });
      });

      const result = await fetchAllPokemon();

      expect(result).toHaveLength(151);
      expect(result[0].id).toBe(1);
      expect(result[150].id).toBe(151);
      expect(fetch).toHaveBeenCalledTimes(151);
    });
  });
});
