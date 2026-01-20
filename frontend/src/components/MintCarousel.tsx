/**
 * Composant MintCarousel
 * Affiche un carrousel des derniers Pokémon mintés
 */

'use client';

import { useShowcasePokemon } from '@/hooks/useRecentMints';
import Image from 'next/image';
import { RarityBadge } from './RarityBadge';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

function MintCard({ pokemonId, rarityTier }: { tokenId: bigint; pokemonId: number; rarityTier: number }) {
  // Pour la landing page, on utilise les images officielles de PokeAPI
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  
  // Noms des Pokémon populaires
  const pokemonNames: Record<number, string> = {
    25: 'Pikachu #25',
    6: 'Charizard #6',
    3: 'Venusaur #3',
    9: 'Blastoise #9',
    150: 'Mewtwo #150',
    94: 'Gengar #94',
    130: 'Gyarados #130',
    143: 'Snorlax #143',
  };

  return (
    <div className="relative flex-shrink-0 w-48 h-64 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-border/50 shadow-lg group hover:shadow-xl transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      <Image
        src={imageUrl}
        alt={pokemonNames[pokemonId] || `Pokémon #${pokemonId}`}
        fill
        className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
        unoptimized
      />

      <div className="absolute top-2 right-2">
        <RarityBadge tier={rarityTier as 1 | 2 | 3 | 4} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white font-bold text-sm truncate drop-shadow-lg">
          {pokemonNames[pokemonId] || `Pokémon #${pokemonId}`}
        </p>
        <p className="text-white/80 text-xs">Popular Choice</p>
      </div>

      <div className="absolute top-2 left-2">
        <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
      </div>
    </div>
  );
}

export function MintCarousel() {
  const { showcasePokemon } = useShowcasePokemon();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const visibleCards = 5;
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < Math.max(0, showcasePokemon.length - visibleCards);

  const scrollLeft = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const scrollRight = () => {
    setCurrentIndex((prev) => Math.min(showcasePokemon.length - visibleCards, prev + 1));
  };

  // Auto-scroll with pause on hover
  useEffect(() => {
    if (showcasePokemon.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        return next >= showcasePokemon.length - visibleCards ? 0 : next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [showcasePokemon.length, visibleCards, isPaused]);

  return (
    <div className="relative">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-yellow-500" />
        Featured Collection
      </h3>

      <div className="relative">
        {/* Navigation buttons */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm border border-border rounded-full p-2 shadow-lg hover:bg-background transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm border border-border rounded-full p-2 shadow-lg hover:bg-background transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Carousel */}
        <div 
          className="overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="flex gap-4 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentIndex * (192 + 16)}px)`, // 192px = w-48, 16px = gap
            }}
          >
            {showcasePokemon.map((pokemon, idx) => (
              <MintCard
                key={`${pokemon.pokemonId}-${idx}`}
                tokenId={pokemon.tokenId}
                pokemonId={pokemon.pokemonId}
                rarityTier={pokemon.rarityTier}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
