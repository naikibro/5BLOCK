/**
 * Skeleton loader pour PokemonCard
 * Affiche un placeholder animé pendant le chargement
 */

import { Card, CardContent, CardFooter } from '@/components/ui/card';

export function PokemonCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Image placeholder */}
      <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />

      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Types */}
        <div className="flex gap-1 mb-3">
          <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="h-3 w-8 bg-gray-200 rounded mx-auto mb-1 animate-pulse" />
              <div className="h-5 w-6 bg-gray-200 rounded mx-auto animate-pulse" />
            </div>
          ))}
        </div>

        {/* Value */}
        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between">
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </CardContent>

      {/* Button */}
      <CardFooter className="p-4 pt-0">
        <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
      </CardFooter>
    </Card>
  );
}
