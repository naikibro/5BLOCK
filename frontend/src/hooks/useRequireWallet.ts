import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Hook to protect routes that require a connected wallet.
 * Redirects to home page if wallet is disconnected.
 * 
 * @returns {Object} { isConnected: boolean }
 * 
 * @example
 * // In a protected page component
 * function InventoryPage() {
 *   const { isConnected } = useRequireWallet();
 *   
 *   if (!isConnected) {
 *     return null; // or a loading state
 *   }
 *   
 *   return <div>Protected content</div>;
 * }
 */
export function useRequireWallet() {
  const { isConnected, isDisconnected, isConnecting } = useAccount();
  const router = useRouter();

  useEffect(() => {
    // Redirect if explicitly disconnected OR if not connected and not in connecting state
    // This prevents race conditions during the initial load
    if (isDisconnected || (!isConnected && !isConnecting)) {
      router.push('/');
    }
  }, [isDisconnected, isConnected, isConnecting, router]);

  return { isConnected };
}
