import { renderHook } from '@testing-library/react';
import { useNetworkStatus } from '../useNetworkStatus';
import { useChainId } from 'wagmi';

jest.mock('wagmi');

describe('useNetworkStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('US-1.3: AC-1.3.1 - Network detection', () => {
    it('should detect Sepolia as supported network', () => {
      (useChainId as jest.Mock).mockReturnValue(11155111); // Sepolia

      const { result } = renderHook(() => useNetworkStatus());

      expect(result.current.chainId).toBe(11155111);
      expect(result.current.isSupported).toBe(true);
      expect(result.current.chainName).toBe('Sepolia');
      expect(result.current.currentChain).toBeDefined();
    });

    it('should detect Hardhat as supported network', () => {
      (useChainId as jest.Mock).mockReturnValue(31337); // Hardhat

      const { result } = renderHook(() => useNetworkStatus());

      expect(result.current.chainId).toBe(31337);
      expect(result.current.isSupported).toBe(true);
      expect(result.current.chainName).toBe('Localhost');
    });

    it('should detect unsupported network', () => {
      (useChainId as jest.Mock).mockReturnValue(1); // Ethereum Mainnet

      const { result } = renderHook(() => useNetworkStatus());

      expect(result.current.chainId).toBe(1);
      expect(result.current.isSupported).toBe(false);
      expect(result.current.chainName).toBe('Unknown Network');
      expect(result.current.currentChain).toBeUndefined();
    });

    it('should handle chain ID changes', () => {
      (useChainId as jest.Mock).mockReturnValue(11155111);

      const { result, rerender } = renderHook(() => useNetworkStatus());

      expect(result.current.isSupported).toBe(true);

      // Change to unsupported network
      (useChainId as jest.Mock).mockReturnValue(1);
      rerender();

      expect(result.current.isSupported).toBe(false);
    });
  });
});
