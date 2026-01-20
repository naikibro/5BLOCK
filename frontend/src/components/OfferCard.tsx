/**
 * Composant pour afficher une offre d'échange
 * Visualise le swap entre deux cartes avec images et détails
 */

'use client';

import Image from 'next/image';
import type { TradeOffer } from '@/hooks/useOpenOffers';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatAddress, formatTimestamp } from '@/lib/utils';

interface OfferCardProps {
  offer: TradeOffer;
  onAccept?: () => void;
  onCancel?: () => void;
}

/**
 * Carte affichant une offre d'échange
 * Montre les deux cartes avec une flèche entre elles
 */
export function OfferCard({ offer, onAccept, onCancel }: OfferCardProps) {
  const makerImageUrl = offer.makerCard.metadata?.image?.replace(
    'ipfs://',
    'https://gateway.pinata.cloud/ipfs/'
  );
  const takerImageUrl = offer.takerCard.metadata?.image?.replace(
    'ipfs://',
    'https://gateway.pinata.cloud/ipfs/'
  );

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        {/* Header with badges */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">
            Offer #{offer.offerId.toString()}
          </span>
          <div className="flex gap-2">
            {offer.isMyOffer && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Your Offer
              </Badge>
            )}
            {offer.canAccept && (
              <Badge className="bg-green-500 text-white">Can Accept</Badge>
            )}
          </div>
        </div>

        {/* Cards swap visualization */}
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Maker's card (offered) */}
          <div className="flex-1 text-center">
            <div className="relative aspect-square w-24 mx-auto bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
              {makerImageUrl ? (
                <Image
                  src={makerImageUrl}
                  alt={offer.makerCard.metadata?.name ?? 'Card'}
                  fill
                  className="object-contain p-2"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  Loading...
                </div>
              )}
            </div>
            <p className="mt-2 text-sm font-medium truncate">
              {offer.makerCard.metadata?.name ?? `#${offer.makerTokenId}`}
            </p>
            <p className="text-xs text-gray-500">Offered</p>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 text-gray-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </div>

          {/* Taker's card (requested) */}
          <div className="flex-1 text-center">
            <div className="relative aspect-square w-24 mx-auto bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
              {takerImageUrl ? (
                <Image
                  src={takerImageUrl}
                  alt={offer.takerCard.metadata?.name ?? 'Card'}
                  fill
                  className="object-contain p-2"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  Loading...
                </div>
              )}
            </div>
            <p className="mt-2 text-sm font-medium truncate">
              {offer.takerCard.metadata?.name ?? `#${offer.takerTokenId}`}
            </p>
            <p className="text-xs text-gray-500">Requested</p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <div>By {formatAddress(offer.maker)}</div>
              <div className="text-xs text-gray-500">
                {formatTimestamp(offer.createdAt)}
              </div>
            </div>

            <div className="flex gap-2">
              {offer.isMyOffer && onCancel && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onCancel}
                  className="text-xs"
                >
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel
                </Button>
              )}
              {offer.canAccept && onAccept && (
                <Button size="sm" onClick={onAccept} className="text-xs">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Accept
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
