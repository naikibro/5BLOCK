'use client';

import { useRequireWallet } from '@/hooks/useRequireWallet';

/**
 * Protected trade page - requires wallet connection.
 * Demonstrates AC-1.2.5: Redirection from protected pages.
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
        <section aria-labelledby="trade-description" className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-6">
          <h2 id="trade-description" className="sr-only">Trade page information</h2>
          <p className="text-gray-700 text-base">
            This is a protected page. You can only access it when your wallet is connected.
          </p>
          <p className="text-gray-700 mt-4 text-base">
            If you disconnect your wallet, you will be automatically redirected to the home page.
          </p>
          <div className="mt-8 p-4 bg-blue-50 rounded-md border-2 border-blue-600" role="status">
            <p className="text-sm text-blue-900 font-semibold">
              <strong>Coming soon:</strong> Trade Pokemon cards with other users here.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
