import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletConnect } from '../WalletConnect';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';

// Mocks are already configured in jest.config.js
jest.mock('wagmi');
jest.mock('@tanstack/react-query');

describe('WalletConnect', () => {
  let mockDisconnect: jest.Mock;
  let mockConnect: jest.Mock;
  let mockQueryClient: {
    clear: jest.Mock;
    invalidateQueries: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockDisconnect = jest.fn();
    mockConnect = jest.fn();
    mockQueryClient = {
      clear: jest.fn(),
      invalidateQueries: jest.fn(),
    };

    (useAccount as jest.Mock).mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isDisconnected: true,
    });

    (useConnect as jest.Mock).mockReturnValue({
      connect: mockConnect,
      error: null,
      isPending: false,
    });

    (useDisconnect as jest.Mock).mockReturnValue({
      disconnect: mockDisconnect,
      isPending: false,
    });

    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
  });

  describe('US-1.2: Déconnexion Wallet', () => {
    describe('AC-1.2.1: Bouton Disconnect visible quand connecté', () => {
      it('should show Disconnect button when wallet is connected', async () => {
        (useAccount as jest.Mock).mockReturnValue({
          address: '0x1234567890123456789012345678901234567890',
          isConnected: true,
          isConnecting: false,
          isDisconnected: false,
        });

        render(<WalletConnect />);
        
        await waitFor(() => {
          const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
          expect(disconnectButton).toBeInTheDocument();
        });
      });

      it('should NOT show Disconnect button when wallet is not connected', () => {
        render(<WalletConnect />);
        
        const disconnectButton = screen.queryByRole('button', { name: /disconnect/i });
        expect(disconnectButton).not.toBeInTheDocument();
      });

      it('should display formatted address when connected', async () => {
        (useAccount as jest.Mock).mockReturnValue({
          address: '0x1234567890123456789012345678901234567890',
          isConnected: true,
          isConnecting: false,
          isDisconnected: false,
        });

        render(<WalletConnect />);
        
        await waitFor(() => {
          expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
        });
      });
    });

    describe('AC-1.2.2: Session terminée au clic', () => {
      it('should call disconnect when Disconnect button is clicked', async () => {
        (useAccount as jest.Mock).mockReturnValue({
          address: '0x1234567890123456789012345678901234567890',
          isConnected: true,
          isConnecting: false,
          isDisconnected: false,
        });

        render(<WalletConnect />);
        
        await waitFor(() => {
          const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
          fireEvent.click(disconnectButton);
        });

        expect(mockDisconnect).toHaveBeenCalled();
      });
    });

    describe('AC-1.2.3: UI revient à état non connecté', () => {
      it('should show Connect Wallet button after disconnect', () => {
        render(<WalletConnect />);
        
        const connectButton = screen.getByRole('button', { name: /connect wallet/i });
        expect(connectButton).toBeInTheDocument();
      });
    });

    describe('AC-1.2.4: Cache react-query nettoyé', () => {
      it('should invalidate wallet-specific queries when disconnecting', async () => {
        (useAccount as jest.Mock).mockReturnValue({
          address: '0x1234567890123456789012345678901234567890',
          isConnected: true,
          isConnecting: false,
          isDisconnected: false,
        });

        render(<WalletConnect />);
        
        await waitFor(() => {
          const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
          fireEvent.click(disconnectButton);
        });

        // Should invalidate specific wallet queries, not clear all cache
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['ownedCards'] });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['userOffers'] });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['wallet'] });
      });
    });
  });

  describe('Connection functionality', () => {
    it('should show Connect Wallet button when not connected', () => {
      render(<WalletConnect />);
      
      const connectButton = screen.getByRole('button', { name: /connect wallet/i });
      expect(connectButton).toBeInTheDocument();
    });

    it('should show connecting state', () => {
      (useAccount as jest.Mock).mockReturnValue({
        address: undefined,
        isConnected: false,
        isConnecting: true,
        isDisconnected: false,
      });

      render(<WalletConnect />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(/connecting/i);
      expect(button).toBeDisabled();
    });

    it('should detect MetaMask not installed', async () => {
      // Mock window.ethereum as undefined
      Object.defineProperty(window, 'ethereum', {
        value: undefined,
        writable: true,
      });

      render(<WalletConnect />);
      
      await waitFor(() => {
        const connectButton = screen.getByRole('button', { name: /connect wallet/i });
        fireEvent.click(connectButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/metamask is not installed/i)).toBeInTheDocument();
        expect(screen.getByText(/install metamask/i)).toBeInTheDocument();
      });
    });

    it('should show error when connection is rejected by user', async () => {
      (useConnect as jest.Mock).mockReturnValue({
        connect: mockConnect,
        error: { message: 'User rejected the request' },
        isPending: false,
      });

      render(<WalletConnect />);
      
      await waitFor(() => {
        expect(screen.getByText(/connection request was rejected/i)).toBeInTheDocument();
      });
    });

    it('should show error when connection is already processing', async () => {
      (useConnect as jest.Mock).mockReturnValue({
        connect: mockConnect,
        error: { message: 'Request already processing' },
        isPending: false,
      });

      render(<WalletConnect />);
      
      await waitFor(() => {
        expect(screen.getByText(/already pending/i)).toBeInTheDocument();
      });
    });

    it('should show generic error for unknown connection errors', async () => {
      (useConnect as jest.Mock).mockReturnValue({
        connect: mockConnect,
        error: { message: 'Some unknown error occurred' },
        isPending: false,
      });

      render(<WalletConnect />);
      
      await waitFor(() => {
        expect(screen.getByText(/an error occurred while connecting/i)).toBeInTheDocument();
      });
    });
  });
});
