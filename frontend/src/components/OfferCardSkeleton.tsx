/**
 * Skeleton loader pour OfferCard
 * Affiche un placeholder animé pendant le chargement des offres
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';

/**
 * Composant skeleton qui imite la structure d'OfferCard
 * Utilise des animations de pulse pour indiquer le chargement
 */
export function OfferCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Header with badges */}
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Cards swap visualization */}
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Maker's card (offered) */}
          <div className="flex-1 text-center">
            <div className="aspect-square w-24 mx-auto bg-gray-200 rounded-lg animate-pulse" />
            <div className="mt-2 h-4 w-20 bg-gray-200 rounded mx-auto animate-pulse" />
            <div className="mt-1 h-3 w-16 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Taker's card (requested) */}
          <div className="flex-1 text-center">
            <div className="aspect-square w-24 mx-auto bg-gray-200 rounded-lg animate-pulse" />
            <div className="mt-2 h-4 w-20 bg-gray-200 rounded mx-auto animate-pulse" />
            <div className="mt-1 h-3 w-16 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="mt-1 h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
