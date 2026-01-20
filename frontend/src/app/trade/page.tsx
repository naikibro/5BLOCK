'use client';

import { useState } from 'react';
import { useRequireWallet } from '@/hooks/useRequireWallet';
import { useOpenOffers } from '@/hooks/useOpenOffers';
import { CreateOfferForm } from '@/components/CreateOfferForm';
import { OfferCard } from '@/components/OfferCard';
import { OfferCardSkeleton } from '@/components/OfferCardSkeleton';

/**
 * Protected trade page - requires wallet connection.
 * Allows users to create trade offers and view all open offers.
 */
export default function TradePage() {
  const { isConnected } = useRequireWallet();
  const { offers, myOffers, acceptableOffers, isLoading } =
    useOpenOffers();
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'acceptable'>('all');

  // Show loading state while checking connection
  if (!isConnected) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-pulse text-gray-700 font-medium">
            Checking wallet connection...
          </div>
        </div>
      </div>
    );
  }

  const displayedOffers = {
    all: offers,
    mine: myOffers,
    acceptable: acceptableOffers,
  }[activeTab];

  const handleAccept = (offerId: bigint) => {
    // TODO: Navigate to accept page or show accept modal (US-3.3)
    console.log('Accept offer:', offerId);
  };

  const handleCancel = (offerId: bigint) => {
    // TODO: Navigate to cancel page or show cancel modal (US-3.4)
    console.log('Cancel offer:', offerId);
  };

  return (
    <div className="flex min-h-screen flex-col p-8">
      <div className="max-w-7xl mx-auto w-full">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          Trade Marketplace
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Create offer form */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Create Trade Offer
            </h2>
            <CreateOfferForm />
          </div>

          {/* Right: Offers list */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Browse Offers
            </h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                All Offers ({offers.length})
              </button>
              <button
                onClick={() => setActiveTab('acceptable')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'acceptable'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Can Accept ({acceptableOffers.length})
              </button>
              <button
                onClick={() => setActiveTab('mine')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'mine'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                My Offers ({myOffers.length})
              </button>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <OfferCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && displayedOffers.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <p className="text-gray-600 text-lg">
                  {activeTab === 'all' &&
                    'No open offers yet. Create the first one!'}
                  {activeTab === 'acceptable' &&
                    'No offers you can accept right now.'}
                  {activeTab === 'mine' &&
                    "You haven't created any offers yet."}
                </p>
              </div>
            )}

            {/* Offers grid */}
            {!isLoading && displayedOffers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedOffers.map((offer) => (
                  <OfferCard
                    key={offer.offerId.toString()}
                    offer={offer}
                    onAccept={() => handleAccept(offer.offerId)}
                    onCancel={() => handleCancel(offer.offerId)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
