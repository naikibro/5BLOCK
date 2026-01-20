/**
 * Badge pour afficher le type d'un Pokémon
 * Chaque type a une couleur spécifique
 */

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

interface TypeBadgeProps {
  type: string;
  className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const color = TYPE_COLORS[type.toLowerCase()] ?? 'bg-gray-500';

  return (
    <Badge className={`${color} text-white capitalize border-0 ${className || ''}`}>
      {type}
    </Badge>
  );
}
