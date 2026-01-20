/**
 * Page Inventory - Affiche toutes les cartes possédées par l'utilisateur
 * Nécessite une connexion wallet
 */

'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useOwnedCards } from '@/hooks/useOwnedCards';
import { InventoryCard } from '@/components/InventoryCard';
import { InventoryCardSkeleton } from '@/components/InventoryCardSkeleton';
import { Button } from '@/components/ui/button';
import { Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
  const { isConnected, isDisconnected } = useAccount();
  const router = useRouter();
  const { cards, count, maxCards, isLoading, isEmpty } = useOwnedCards();

  // Redirect si non connecté
  useEffect(() => {
    if (isDisconnected) {
      router.push('/');
    }
  }, [isDisconnected, router]);

  if (!isConnected) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Cards</h1>
          <p className="text-gray-600">
            {count} / {maxCards} cards in your collection
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-4">
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${(count / maxCards) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium">
            {count}/{maxCards}
          </span>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <InventoryCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No cards yet</h2>
          <p className="text-gray-600 mb-6">
            Start your collection by minting your first Pokémon card!
          </p>
          <Link href="/catalog">
            <Button>
              Browse Catalog
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}

      {/* Cards grid */}
      {!isLoading && !isEmpty && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <InventoryCard
              key={card.tokenId.toString()}
              card={card}
              onViewDetails={() => router.push(`/card/${card.tokenId}`)}
              onProposeTrade={() =>
                router.push(`/trade/create?tokenId=${card.tokenId}`)
              }
            />
          ))}
        </div>
      )}

      {/* Mint more prompt */}
      {!isLoading && count > 0 && count < maxCards && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center border border-blue-200">
          <p className="text-gray-700 mb-2">
            You can mint {maxCards - count} more card{maxCards - count > 1 ? 's' : ''}!
          </p>
          <Link href="/catalog">
            <Button variant="outline" className="border-blue-300 hover:bg-blue-100">
              Browse Catalog
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
