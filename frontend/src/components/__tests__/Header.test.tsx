import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Header } from '../Header';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

jest.mock('wagmi');
jest.mock('@tanstack/react-query');

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useAccount as jest.Mock).mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isDisconnected: true,
    });

    (useChainId as jest.Mock).mockReturnValue(11155111); // Sepolia
    
    (useSwitchChain as jest.Mock).mockReturnValue({
      switchChain: jest.fn(),
      isPending: false,
      error: null,
    });
  });

  it('should render the app title', () => {
    render(<Header />);
    
    expect(screen.getByText('5BLOCK')).toBeInTheDocument();
  });

  it('should render NetworkBadge', async () => {
    render(<Header />);
    
    await waitFor(() => {
      const badge = screen.getByRole('button', { name: /sepolia/i });
      expect(badge).toBeInTheDocument();
    });
  });

  it('should render WalletConnect component', () => {
    render(<Header />);
    
    const connectButton = screen.getByRole('button', { name: /connect wallet/i });
    expect(connectButton).toBeInTheDocument();
  });

  it('should show all components when wallet is connected and on correct network', async () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
      isConnecting: false,
      isDisconnected: false,
    });

    render(<Header />);
    
    await waitFor(() => {
      expect(screen.getByText('5BLOCK')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sepolia/i })).toBeInTheDocument();
      expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument();
    });
  });

  it('should show warning badge when on wrong network', async () => {
    (useChainId as jest.Mock).mockReturnValue(1); // Mainnet

    render(<Header />);
    
    await waitFor(() => {
      expect(screen.getByText('Wrong Network')).toBeInTheDocument();
    });
  });
});
