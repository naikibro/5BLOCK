/**
 * Tests pour AddressDisplay component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddressDisplay } from '../AddressDisplay';

describe('AddressDisplay', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890';

  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve()),
      },
    });
  });

  it('should show loading state when address is undefined', () => {
    render(<AddressDisplay address={undefined} />);

    expect(screen.getByText('Loading address...')).toBeInTheDocument();
  });

  it('should render truncated address', () => {
    render(<AddressDisplay address={mockAddress} />);

    expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
  });

  it('should show "You" badge when isYou is true', () => {
    render(<AddressDisplay address={mockAddress} isYou={true} />);

    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('should not show "You" badge when isYou is false', () => {
    render(<AddressDisplay address={mockAddress} isYou={false} />);

    expect(screen.queryByText('You')).not.toBeInTheDocument();
  });

  it('should copy address to clipboard on button click', async () => {
    render(<AddressDisplay address={mockAddress} />);

    const copyButton = screen.getByRole('button', { name: /copy address/i });
    
    await waitFor(async () => {
      fireEvent.click(copyButton);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockAddress);
    });
  });

  it('should show "Copied!" message after copying', async () => {
    render(<AddressDisplay address={mockAddress} />);

    const copyButton = screen.getByRole('button', { name: /copy address/i });
    
    await waitFor(async () => {
      fireEvent.click(copyButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('should handle copy error gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.reject(new Error('Copy failed'))),
      },
    });

    render(<AddressDisplay address={mockAddress} />);

    const copyButton = screen.getByRole('button');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  it('should render correctly with different address lengths', () => {
    const shortAddress = '0x123';
    render(<AddressDisplay address={shortAddress} />);

    // Should still truncate even if address is short
    const displayedText = screen.getByText(/0x1.../);
    expect(displayedText).toBeInTheDocument();
  });
});
