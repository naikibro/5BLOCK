'use client';

import { useRequireWallet } from '@/hooks/useRequireWallet';
import { CreateOfferForm } from '@/components/CreateOfferForm';

/**
 * Protected trade page - requires wallet connection.
 * Allows users to create trade offers for their Pokémon cards.
 */
export default function TradePage() {
  const { isConnected } = useRequireWallet();

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

  return (
    <div className="flex min-h-screen flex-col p-24">
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Trade Cards</h1>
        
        {/* Create Offer Section */}
        <section aria-labelledby="create-offer-section" className="mb-12">
          <h2 id="create-offer-section" className="text-2xl font-semibold mb-4 text-gray-800">
            Create Trade Offer
          </h2>
          <CreateOfferForm />
        </section>

        {/* Future sections: My Offers, All Open Offers */}
        <div className="mt-12 p-4 bg-blue-50 rounded-md border-2 border-blue-600" role="status">
          <p className="text-sm text-blue-900 font-semibold">
            <strong>Coming soon:</strong> View and manage your offers, browse available trades.
          </p>
        </div>
      </div>
    </div>
  );
}
