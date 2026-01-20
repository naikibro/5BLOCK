import { renderHook, waitFor } from '@testing-library/react';
import { useRequireWallet } from '../useRequireWallet';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

jest.mock('wagmi');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('useRequireWallet', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = jest.fn();
    
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      pathname: '/inventory',
    });
  });

  describe('US-1.2: AC-1.2.5 - Redirection depuis pages protégées', () => {
    it('should redirect to home when wallet is disconnected', async () => {
      (useAccount as jest.Mock).mockReturnValue({
        isConnected: false,
        isDisconnected: true,
        address: undefined,
      });

      renderHook(() => useRequireWallet());

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should NOT redirect when wallet is connected', () => {
      (useAccount as jest.Mock).mockReturnValue({
        isConnected: true,
        isDisconnected: false,
        address: '0x1234567890123456789012345678901234567890',
      });

      renderHook(() => useRequireWallet());

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should return isConnected status', () => {
      (useAccount as jest.Mock).mockReturnValue({
        isConnected: true,
        isDisconnected: false,
        address: '0x1234567890123456789012345678901234567890',
      });

      const { result } = renderHook(() => useRequireWallet());

      expect(result.current.isConnected).toBe(true);
    });

    it('should redirect immediately when disconnected while on protected page', async () => {
      const { rerender } = renderHook(() => useRequireWallet(), {
        initialProps: {
          account: {
            isConnected: true,
            isDisconnected: false,
            address: '0x1234567890123456789012345678901234567890',
          },
        },
      });

      // Initially connected - no redirect
      expect(mockPush).not.toHaveBeenCalled();

      // Simulate disconnection
      (useAccount as jest.Mock).mockReturnValue({
        isConnected: false,
        isDisconnected: true,
        address: undefined,
      });

      rerender();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });
});
