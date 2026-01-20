/**
 * Skeleton loader pour InventoryCard
 * Affiche un placeholder pendant le chargement des cartes
 */

import { Card, CardContent, CardFooter } from '@/components/ui/card';

export function InventoryCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200 animate-pulse" />

      {/* Content skeleton */}
      <CardContent className="p-4">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
        
        {/* Types */}
        <div className="flex gap-1 mb-3">
          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Value */}
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
      </CardContent>

      {/* Button skeleton */}
      <CardFooter className="p-4 pt-0">
        <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
      </CardFooter>
    </Card>
  );
}
