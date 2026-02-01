/**
 * Page Catalog
 * Affiche tous les Pokémon de Gen 1 avec filtres et recherche
 */

"use client";

import { useState } from "react";
import { useFilteredPokemon } from "@/hooks/usePokemon";
import { PokemonCard } from "@/components/PokemonCard";
import { PokemonCardSkeleton } from "@/components/PokemonCardSkeleton";

const TYPES = [
  "all",
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const {
    data: pokemon,
    isLoading,
    error,
  } = useFilteredPokemon({
    type: typeFilter === "all" ? undefined : typeFilter,
    search: search || undefined,
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Pokémon Catalog</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search input */}
        <input
          type="text"
          placeholder="Search by name or number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-xs px-4 py-2 border border-border rounded-md bg-card text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors shadow-sm"
          aria-label="Search Pokemon by name or number"
        />

        {/* Type filter */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full appearance-none px-4 py-2 pr-10 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer shadow-sm"
            aria-label="Filter Pokemon by type"
          >
            {TYPES.map((type) => (
              <option
                key={type}
                value={type}
                className="bg-gray-800 text-white"
              >
                {type === "all"
                  ? "All Types"
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Results count */}
      {pokemon && (
        <p
          className="text-muted-foreground mb-4"
          role="status"
          aria-live="polite"
        >
          Showing {pokemon.length} Pokémon
        </p>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 20 }).map((_, i) => (
            <PokemonCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-12" role="alert">
          <p className="text-red-500 dark:text-red-400 font-medium">
            Error loading Pokémon. Please try again.
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            {(error as Error).message}
          </p>
        </div>
      )}

      {/* Cards grid */}
      {!isLoading && !error && pokemon && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {pokemon.map((p) => (
            <PokemonCard key={p.id} pokemon={p} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && pokemon?.length === 0 && (
        <div className="text-center py-12" role="status">
          <p className="text-muted-foreground">
            No Pokémon found matching your criteria.
          </p>
          <p className="text-muted-foreground/70 text-sm mt-2">
            Try adjusting your filters or search term.
          </p>
        </div>
      )}
    </div>
  );
}
