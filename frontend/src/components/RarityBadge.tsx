/**
 * Badge pour afficher la rareté d'une carte Pokémon
 * Tier 1 (Common): Gris
 * Tier 2 (Uncommon): Vert
 * Tier 3 (Rare): Bleu
 * Tier 4 (Legendary): Or/Jaune
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RarityTier } from '@/types/pokemon';

const RARITY_STYLES: Record<
  RarityTier,
  { bg: string; text: string; label: string }
> = {
  1: { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Common' },
  2: { bg: 'bg-green-200', text: 'text-green-700', label: 'Uncommon' },
  3: { bg: 'bg-blue-200', text: 'text-blue-700', label: 'Rare' },
  4: { bg: 'bg-yellow-200', text: 'text-yellow-700', label: 'Legendary' },
};

interface RarityBadgeProps {
  tier: RarityTier;
  className?: string;
}

export function RarityBadge({ tier, className }: RarityBadgeProps) {
  const style = RARITY_STYLES[tier] ?? RARITY_STYLES[1];

  return (
    <Badge className={cn(style.bg, style.text, 'border-0', className)}>
      {style.label}
    </Badge>
  );
}
