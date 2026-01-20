/**
 * Hooks React Query pour les données Pokémon
 */

import { useQuery } from '@tanstack/react-query';
import { fetchPokemon, fetchAllPokemon } from '@/lib/pokeapi';

/**
 * Hook pour récupérer un Pokémon unique par son ID
 * @param id - ID du Pokémon
 * @returns Query result avec data, isLoading, error, etc.
 */
export function usePokemon(id: number) {
  return useQuery({
    queryKey: ['pokemon', id],
    queryFn: () => fetchPokemon(id),
    staleTime: Infinity, // Les données Pokémon ne changent jamais
  });
}

/**
 * Hook pour récupérer la liste complète des Pokémon Gen 1 (1-151)
 * @returns Query result avec data (array de Pokemon), isLoading, error, etc.
 */
export function usePokemonList() {
  return useQuery({
    queryKey: ['pokemon', 'list'],
    queryFn: fetchAllPokemon,
    staleTime: Infinity, // Les données Pokémon ne changent jamais
  });
}

interface PokemonFilters {
  type?: string;
  search?: string;
}

/**
 * Hook pour récupérer et filtrer les Pokémon
 * @param filters - Filtres à appliquer (type, search)
 * @returns Query result avec data (array filtré), isLoading, error, etc.
 */
export function useFilteredPokemon(filters: PokemonFilters = {}) {
  const { data: allPokemon, ...rest } = usePokemonList();

  // Appliquer les filtres côté client
  const filtered = allPokemon?.filter((pokemon) => {
    // Filtre par type
    if (filters.type && !pokemon.types.includes(filters.type)) {
      return false;
    }

    // Filtre par recherche (nom ou ID)
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchesName = pokemon.name.includes(search);
      const matchesId = pokemon.id.toString().includes(search);
      if (!matchesName && !matchesId) {
        return false;
      }
    }

    return true;
  });

  return { data: filtered, ...rest };
}
