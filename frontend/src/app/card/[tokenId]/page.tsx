/**
 * Page Card Details
 * Affiche les détails complets d'une carte Pokémon (stats, timestamps, provenance)
 */

'use client';

import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useCardDetails } from '@/hooks/useCardDetails';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TypeBadge } from '@/components/TypeBadge';
import { RarityBadge } from '@/components/RarityBadge';
import { AddressDisplay } from '@/components/AddressDisplay';
import { Lock, Unlock, ExternalLink, ArrowRightLeft } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import Link from 'next/link';

export default function CardDetailsPage() {
  const params = useParams();
  const tokenId = BigInt(params.tokenId as string);
  const { address } = useAccount();
  const { details, isLoading, notFound } = useCardDetails(tokenId);

  if (isLoading) {
    return <CardDetailsSkeleton />;
  }

  if (notFound) {
    return (
      <div className="container mx-auto py-16 px-4 text-center" role="main" aria-labelledby="not-found-title">
        <h1 id="not-found-title" className="text-2xl font-bold mb-4">Card Not Found</h1>
        <p className="text-muted-foreground mb-6">
          Token #{tokenId.toString()} does not exist.
        </p>
        <Link href="/catalog" aria-label="Go back to catalog">
          <Button>Browse Catalog</Button>
        </Link>
      </div>
    );
  }

  if (!details) return null;

  const isOwner = address && details.owner 
    ? address.toLowerCase() === details.owner.toLowerCase()
    : false;
  const canTrade = isOwner && !details.isLocked;
  const ipfsGatewayUrl = details.tokenURI?.replace(
    'ipfs://',
    'https://gateway.pinata.cloud/ipfs/'
  );
  const imageUrl = details.metadata?.image?.replace(
    'ipfs://',
    'https://gateway.pinata.cloud/ipfs/'
  );

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8" role="main" aria-labelledby="card-title">
      {/* Back navigation */}
      <Link 
        href="/inventory" 
        className="inline-flex items-center text-sm font-medium bg-background/80 backdrop-blur-sm hover:bg-background/90 px-3 py-2 rounded-lg border border-border/50 transition-colors mb-4 lg:mb-6 shadow-sm"
        aria-label="Back to inventory"
      >
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left: Image */}
        <section className="relative" aria-label="Card image">
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden border border-border/50 shadow-lg">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${details.metadata?.name ?? 'Pokemon Card'} - High resolution image`}
                fill
                className="object-contain p-4 sm:p-8"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground" role="img" aria-label="No image available">
                <p>No image available</p>
              </div>
            )}
          </div>

          {/* Lock Status Badge */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4" aria-label="Card status">
            {details.isLocked ? (
              <Badge 
                variant="destructive" 
                className="flex items-center gap-1.5 text-xs sm:text-sm shadow-lg backdrop-blur-sm bg-red-600/95 border border-red-500/50" 
                aria-label={`Card is locked for ${formatTime(details.lockRemaining)}`}
              >
                <Lock className="h-3 w-3" aria-hidden="true" />
                <span className="font-semibold">{formatTime(details.lockRemaining)}</span>
              </Badge>
            ) : (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1.5 text-xs sm:text-sm shadow-lg backdrop-blur-sm bg-green-600/95 text-white border border-green-500/50" 
                aria-label="Card is available for trade"
              >
                <Unlock className="h-3 w-3" aria-hidden="true" />
                <span className="font-semibold">Available</span>
              </Badge>
            )}
          </div>
        </section>

        {/* Right: Details */}
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <header className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div className="flex items-center flex-wrap gap-2" role="list" aria-label="Pokemon types">
                {details.metadata?.attributes
                  ?.filter((a) => a.trait_type === 'Type')
                  .map((a) => (
                    <TypeBadge key={String(a.value)} type={String(a.value).toLowerCase()} />
                  ))}
              </div>
              <RarityBadge tier={details.rarityTier as 1 | 2 | 3 | 4} />
            </div>
            <h1 id="card-title" className="text-2xl sm:text-3xl lg:text-4xl font-bold break-words mb-1">
              {details.metadata?.name ?? `Card #${tokenId}`}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Token ID: <span className="font-mono font-medium">#{tokenId.toString()}</span>
            </p>
          </header>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {['HP', 'Attack', 'Defense', 'Speed'].map((stat) => {
                const attr = details.metadata?.attributes?.find(
                  (a) => a.trait_type === stat
                );
                const value = Number(attr?.value ?? 0);
                const maxValue = stat === 'HP' ? 255 : 150; // Gen 1 max values
                const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                return (
                  <div key={stat} role="group" aria-label={`${stat}: ${value} out of ${maxValue}`}>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="font-medium">{stat}</span>
                      <span className="font-semibold tabular-nums" aria-label={`${value} points`}>{value}</span>
                    </div>
                    <Progress 
                      value={percentage} 
                      aria-label={`${stat} progress bar at ${Math.round(percentage)}%`}
                      aria-valuenow={value}
                      aria-valuemin={0}
                      aria-valuemax={maxValue}
                    />
                  </div>
                );
              })}

              <div className="pt-4 border-t grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Value</div>
                  <div className="text-xl sm:text-2xl font-bold tabular-nums" aria-label={`Total value: ${details.value}`}>
                    {details.value}
                  </div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Rarity</div>
                  <RarityBadge tier={details.rarityTier as 1 | 2 | 3 | 4} className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">Created</span>
                <time className="text-xs sm:text-sm tabular-nums" dateTime={details.createdAt.toISOString()}>
                  {formatDate(details.createdAt)}
                </time>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">Last Transfer</span>
                <time className="text-xs sm:text-sm tabular-nums" dateTime={details.lastTransferAt.toISOString()}>
                  {formatDate(details.lastTransferAt)}
                </time>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">Lock Status</span>
                <span className="text-xs sm:text-sm">
                  {details.isLocked
                    ? `Locked until ${formatDate(details.lockUntil)}`
                    : 'Available for trade'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Provenance */}
          <Card>
            <CardHeader>
              <CardTitle>Provenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs sm:text-sm text-muted-foreground mb-1 font-medium">Current Owner</div>
                <AddressDisplay address={details.owner} isYou={isOwner} />
              </div>

              {details.previousOwners.length > 0 && (
                <div>
                  <div className="text-xs sm:text-sm text-muted-foreground mb-1 font-medium">
                    Previous Owners ({details.previousOwners.length})
                  </div>
                  <div className="space-y-1" role="list" aria-label="Previous owners list">
                    {details.previousOwners.slice(0, 10).map((addr, i) => (
                      <div key={i} role="listitem">
                        <AddressDisplay address={addr} />
                      </div>
                    ))}
                    {details.previousOwners.length > 10 && (
                      <p className="text-xs text-muted-foreground italic pt-1">
                        + {details.previousOwners.length - 10} more owners
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t">
                <div className="text-xs sm:text-sm text-muted-foreground mb-1 font-medium">Metadata</div>
                <a
                  href={ipfsGatewayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded inline-flex items-center gap-1"
                  aria-label="View card metadata on IPFS (opens in new tab)"
                >
                  View on IPFS <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {isOwner && (
            <Link 
              href={`/trade/create?tokenId=${tokenId}`}
              aria-label={canTrade ? 'Propose a trade for this card' : 'Card is locked and cannot be traded'}
              className={!canTrade ? 'pointer-events-none' : ''}
            >
              <Button 
                className="w-full" 
                size="lg" 
                disabled={!canTrade}
                aria-disabled={!canTrade}
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                {canTrade ? 'Propose Trade' : 'Card is Locked'}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loading state
 */
function CardDetailsSkeleton() {
  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8" role="main" aria-busy="true" aria-label="Loading card details">
      <div className="h-10 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-4 lg:mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse border border-border/50 shadow-lg" aria-label="Loading card image" />
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded mb-3" />
            <div className="h-10 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
      </div>
      <span className="sr-only">Loading card details, please wait...</span>
    </div>
  );
}
