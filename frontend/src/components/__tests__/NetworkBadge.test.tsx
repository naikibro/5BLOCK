import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NetworkBadge } from '../NetworkBadge';
import { useChainId, useSwitchChain } from 'wagmi';

jest.mock('wagmi');

describe('NetworkBadge', () => {
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

  describe('US-1.3: AC-1.3.1 - Display current network', () => {
    it('should display Sepolia badge when on Sepolia', () => {
      (useChainId as jest.Mock).mockReturnValue(11155111);

      render(<NetworkBadge />);

      expect(screen.getByText('Sepolia')).toBeInTheDocument();
      expect(screen.queryByText('Wrong Network')).not.toBeInTheDocument();
    });

    it('should display Localhost badge when on Hardhat', () => {
      (useChainId as jest.Mock).mockReturnValue(31337);

      render(<NetworkBadge />);

      expect(screen.getByText('Localhost')).toBeInTheDocument();
    });
  });

  describe('US-1.3: AC-1.3.2 - Warning on unsupported network', () => {
    it('should show warning when on unsupported network', () => {
      (useChainId as jest.Mock).mockReturnValue(1); // Mainnet

      render(<NetworkBadge />);

      expect(screen.getByText('Wrong Network')).toBeInTheDocument();
    });
  });

  describe('US-1.3: AC-1.3.3 - Switch Network button', () => {
    it('should show Switch to Sepolia button on wrong network', () => {
      (useChainId as jest.Mock).mockReturnValue(1);

      render(<NetworkBadge />);

      const switchButton = screen.getByRole('button', { name: /switch to sepolia/i });
      expect(switchButton).toBeInTheDocument();
    });

    it('should call switchChain when button is clicked', async () => {
      (useChainId as jest.Mock).mockReturnValue(1);

      render(<NetworkBadge />);

      const switchButton = screen.getByRole('button', { name: /switch to sepolia/i });
      fireEvent.click(switchButton);

      await waitFor(() => {
        expect(mockSwitchChain).toHaveBeenCalledWith(
          { chainId: 11155111 },
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          })
        );
      });
    });

    it('should disable button while switching', () => {
      (useChainId as jest.Mock).mockReturnValue(1);
      (useSwitchChain as jest.Mock).mockReturnValue({
        switchChain: mockSwitchChain,
        isPending: true,
        error: null,
      });

      render(<NetworkBadge />);

      const switchButton = screen.getByRole('button');
      expect(switchButton).toBeDisabled();
      expect(switchButton).toHaveTextContent(/switching/i);
    });
  });

  describe('US-1.3: AC-1.3.4 & AC-1.3.6 - UI updates on network change', () => {
    it('should update badge when network changes', () => {
      (useChainId as jest.Mock).mockReturnValue(1);

      const { rerender } = render(<NetworkBadge />);

      expect(screen.getByText('Wrong Network')).toBeInTheDocument();

      // Simulate network switch
      (useChainId as jest.Mock).mockReturnValue(11155111);
      rerender(<NetworkBadge />);

      expect(screen.queryByText('Wrong Network')).not.toBeInTheDocument();
      expect(screen.getByText('Sepolia')).toBeInTheDocument();
    });
  });

  describe('Network switching between supported networks', () => {
    it('should show dropdown menu when clicking on network badge', async () => {
      (useChainId as jest.Mock).mockReturnValue(11155111); // Sepolia

      render(<NetworkBadge />);

      const badge = screen.getByRole('button', { name: /sepolia/i });
      fireEvent.click(badge);

      await waitFor(() => {
        expect(screen.getByText('Sepolia Testnet')).toBeInTheDocument();
        expect(screen.getByText('Localhost (Hardhat)')).toBeInTheDocument();
      });
    });

    it('should allow switching from Sepolia to Hardhat', async () => {
      (useChainId as jest.Mock).mockReturnValue(11155111); // Sepolia

      render(<NetworkBadge />);

      // Open menu
      const badge = screen.getByRole('button', { name: /sepolia/i });
      fireEvent.click(badge);

      await waitFor(() => {
        const localhostOption = screen.getByRole('menuitem', { name: /localhost \(hardhat\)/i });
        fireEvent.click(localhostOption);
      });

      expect(mockSwitchChain).toHaveBeenCalledWith(
        { chainId: 31337 },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    it('should allow switching from Hardhat to Sepolia', async () => {
      (useChainId as jest.Mock).mockReturnValue(31337); // Hardhat

      render(<NetworkBadge />);

      // Open menu
      const badge = screen.getByRole('button', { name: /localhost/i });
      fireEvent.click(badge);

      await waitFor(() => {
        const sepoliaOption = screen.getByRole('menuitem', { name: /sepolia testnet/i });
        fireEvent.click(sepoliaOption);
      });

      expect(mockSwitchChain).toHaveBeenCalledWith(
        { chainId: 11155111 },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    it('should mark current network with checkmark in menu', async () => {
      (useChainId as jest.Mock).mockReturnValue(11155111); // Sepolia

      render(<NetworkBadge />);

      const badge = screen.getByRole('button', { name: /sepolia/i });
      fireEvent.click(badge);

      await waitFor(() => {
        const sepoliaOption = screen.getByRole('menuitem', { name: /sepolia testnet/i });
        expect(sepoliaOption).toHaveTextContent('✓');
      });
    });

    it('should close menu when clicking outside', async () => {
      (useChainId as jest.Mock).mockReturnValue(11155111);

      render(<NetworkBadge />);

      // Open menu
      const badge = screen.getByRole('button', { name: /sepolia/i });
      fireEvent.click(badge);

      await waitFor(() => {
        expect(screen.getByText('Sepolia Testnet')).toBeInTheDocument();
      });

      // Click backdrop
      const backdrop = document.querySelector('.fixed.inset-0');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      await waitFor(() => {
        expect(screen.queryByText('Sepolia Testnet')).not.toBeInTheDocument();
      });
    });
  });
});
