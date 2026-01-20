import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NetworkGuard } from '../NetworkGuard';
import { useChainId, useSwitchChain } from 'wagmi';

jest.mock('wagmi');

describe('NetworkGuard', () => {
  let mockSwitchChain: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSwitchChain = jest.fn();

    (useSwitchChain as jest.Mock).mockReturnValue({
      switchChain: mockSwitchChain,
      isPending: false,
      error: null,
    });
  });

  describe('US-1.3: AC-1.3.2 - Block access on wrong network', () => {
    it('should render children when on supported network', () => {
      (useChainId as jest.Mock).mockReturnValue(11155111); // Sepolia

      render(
        <NetworkGuard>
          <div>Protected Content</div>
        </NetworkGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText(/wrong network/i)).not.toBeInTheDocument();
    });

    it('should show warning instead of children on unsupported network', () => {
      (useChainId as jest.Mock).mockReturnValue(1); // Mainnet

      render(
        <NetworkGuard>
          <div>Protected Content</div>
        </NetworkGuard>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText(/wrong network detected/i)).toBeInTheDocument();
    });

    it('should display current network name in warning', () => {
      (useChainId as jest.Mock).mockReturnValue(1);

      render(
        <NetworkGuard>
          <div>Protected Content</div>
        </NetworkGuard>
      );

      expect(screen.getByText(/unknown network/i)).toBeInTheDocument();
    });
  });

  describe('US-1.3: AC-1.3.3 - Switch network from guard', () => {
    it('should provide switch button in warning', () => {
      (useChainId as jest.Mock).mockReturnValue(1);

      render(
        <NetworkGuard>
          <div>Protected Content</div>
        </NetworkGuard>
      );

      const switchButton = screen.getByRole('button', { name: /switch to sepolia/i });
      expect(switchButton).toBeInTheDocument();
    });

    it('should call switchChain when switch button is clicked', () => {
      (useChainId as jest.Mock).mockReturnValue(1);

      render(
        <NetworkGuard>
          <div>Protected Content</div>
        </NetworkGuard>
      );

      const switchButton = screen.getByRole('button', { name: /switch to sepolia/i });
      fireEvent.click(switchButton);

      expect(mockSwitchChain).toHaveBeenCalledWith(
        { chainId: 11155111 },
        expect.objectContaining({
          onError: expect.any(Function),
        })
      );
    });

    it('should show Localhost button as alternative', () => {
      (useChainId as jest.Mock).mockReturnValue(1);

      render(
        <NetworkGuard>
          <div>Protected Content</div>
        </NetworkGuard>
      );

      const localhostButton = screen.getByRole('button', { name: /switch to localhost/i });
      expect(localhostButton).toBeInTheDocument();
    });
  });

  describe('US-1.3: AC-1.3.4 - UI updates after switch', () => {
    it('should show children after successful network switch', () => {
      (useChainId as jest.Mock).mockReturnValue(1);

      const { rerender } = render(
        <NetworkGuard>
          <div>Protected Content</div>
        </NetworkGuard>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();

      // Simulate successful switch
      (useChainId as jest.Mock).mockReturnValue(11155111);
      rerender(
        <NetworkGuard>
          <div>Protected Content</div>
        </NetworkGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText(/wrong network/i)).not.toBeInTheDocument();
    });
  });
});
