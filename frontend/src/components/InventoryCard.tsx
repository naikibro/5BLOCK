/**
 * Composant InventoryCard
 * Affiche une carte possédée avec ses métadonnées et son état de lock
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { OwnedCard } from '@/types/pokemon';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, ArrowRightLeft } from 'lucide-react';
import { TypeBadge } from './TypeBadge';
import { RarityBadge } from './RarityBadge';

interface InventoryCardProps {
  card: OwnedCard;
  onViewDetails?: () => void;
  onProposeTrade?: () => void;
}

/**
 * Formate le temps restant du lock en MM:SS
 */
function formatLockTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function InventoryCard({ card, onViewDetails, onProposeTrade }: InventoryCardProps) {
  const { metadata, tokenId, rarityTier, value, lockUntil } = card;
  
  // État local pour le countdown en temps réel
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const lockRemaining = Math.max(0, lockUntil - now);
  const isLocked = lockRemaining > 0;

  // Mettre à jour le countdown chaque seconde
  useEffect(() => {
    if (!isLocked) return;
    
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked]);

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onViewDetails}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
        {metadata?.image && (
          <Image
            src={
              metadata.image.startsWith('ipfs://')
                ? metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
                : metadata.image.startsWith('http')
                ? metadata.image
                : `https://gateway.pinata.cloud/ipfs/${metadata.image}`
            }
            alt={metadata?.name ?? 'Pokemon Card'}
            fill
            className="object-contain p-4"
            unoptimized
          />
        )}

        {/* Rarity badge */}
        <RarityBadge tier={rarityTier} className="absolute top-2 right-2" />

        {/* Lock indicator */}
        <div className="absolute top-2 left-2">
          {isLocked ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              {formatLockTime(lockRemaining)}
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
              <Unlock className="h-3 w-3" />
              Available
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg truncate">
            {metadata?.name ?? `Card #${tokenId}`}
          </h3>
          <span className="text-xs text-gray-500">
            #{tokenId.toString()}
          </span>
        </div>

        {/* Types */}
        <div className="flex gap-1 mb-3 flex-wrap">
          {metadata?.attributes
            ?.filter((a) => a.trait_type === 'Type')
            .map((a) => (
              <TypeBadge key={a.value} type={String(a.value).toLowerCase()} />
            ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-sm text-center">
          {['HP', 'Attack', 'Defense'].map((stat) => {
            const attr = metadata?.attributes?.find((a) => a.trait_type === stat);
            return (
              <div key={stat}>
                <div className="text-gray-500 text-xs">{stat.slice(0, 3).toUpperCase()}</div>
                <div className="font-semibold">{attr?.value ?? '-'}</div>
              </div>
            );
          })}
        </div>

        {/* Value */}
        <div className="mt-3 pt-3 border-t flex justify-between text-sm">
          <span className="text-gray-500">Value</span>
          <span className="font-semibold">{value}</span>
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          variant={isLocked ? 'outline' : 'default'}
          disabled={isLocked}
          onClick={(e) => {
            e.stopPropagation();
            onProposeTrade?.();
          }}
        >
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          {isLocked ? 'Locked' : 'Propose Trade'}
        </Button>
      </CardFooter>
    </Card>
  );
}
