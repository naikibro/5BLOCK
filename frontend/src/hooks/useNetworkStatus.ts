import { useChainId } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';

const SUPPORTED_CHAINS = [sepolia, hardhat];
const SUPPORTED_CHAIN_IDS: number[] = SUPPORTED_CHAINS.map(c => c.id);

/**
 * Hook to check if the current network is supported.
 * 
 * @returns {Object} Network status information
 * @property {number} chainId - Current chain ID
 * @property {boolean} isSupported - Whether the current chain is supported
 * @property {Object|undefined} currentChain - Current chain object if supported
 * @property {string} chainName - Human-readable chain name
 * 
 * @example
 * function MyComponent() {
 *   const { isSupported, chainName } = useNetworkStatus();
 *   
 *   if (!isSupported) {
 *     return <div>Please switch to {chainName}</div>;
 *   }
 *   
 *   return <div>Connected to {chainName}</div>;
 * }
 */
export function useNetworkStatus() {
  const chainId = useChainId();

  const isSupported = SUPPORTED_CHAIN_IDS.includes(chainId);
  const currentChain = SUPPORTED_CHAINS.find(c => c.id === chainId);

  return {
    chainId,
    isSupported,
    currentChain,
    chainName: currentChain?.name ?? 'Unknown Network',
  };
}
