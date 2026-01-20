/**
 * Composant PokemonCard
 * Affiche une carte Pokémon avec image, stats et bouton Mint
 */

'use client';

import Image from 'next/image';
import { Pokemon } from '@/types/pokemon';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { TypeBadge } from './TypeBadge';
import { RarityBadge } from './RarityBadge';
import { MintButton } from './MintButton';

interface PokemonCardProps {
  pokemon: Pokemon;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image avec rareté badge */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
        <Image
          src={pokemon.image}
          alt={pokemon.displayName}
          fill
          className="object-contain p-4"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <RarityBadge
          tier={pokemon.rarityTier}
          className="absolute top-2 right-2"
        />
      </div>

      <CardContent className="p-4">
        {/* Header: Nom + ID */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">{pokemon.displayName}</h3>
          <span className="text-sm text-muted-foreground">#{pokemon.id}</span>
        </div>

        {/* Types */}
        <div className="flex gap-1 mb-3 flex-wrap">
          {pokemon.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <StatDisplay label="HP" value={pokemon.stats.hp} />
          <StatDisplay label="ATK" value={pokemon.stats.attack} />
          <StatDisplay label="DEF" value={pokemon.stats.defense} />
        </div>

        {/* Value */}
        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Value</span>
            <span className="font-semibold">{pokemon.value}</span>
          </div>
        </div>
      </CardContent>

      {/* Bouton Mint */}
      <CardFooter className="p-4 pt-0">
        <MintButton pokemon={pokemon} />
      </CardFooter>
    </Card>
  );
}

/**
 * Composant helper pour afficher une stat
 */
function StatDisplay({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
