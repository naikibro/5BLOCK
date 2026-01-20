/**
 * Tests pour les fonctions utilitaires
 */

import { formatDate, formatTime, cn, formatAddress, formatTimestamp, ipfsToGateway } from '../utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2026-01-15T14:32:00');
    const formatted = formatDate(date);
    
    expect(formatted).toBe('Jan 15, 2026 14:32');
  });

  it('should pad single-digit minutes', () => {
    const date = new Date('2026-03-05T09:05:00');
    const formatted = formatDate(date);
    
    expect(formatted).toBe('Mar 5, 2026 09:05');
  });

  it('should handle different months', () => {
    const dates = [
      { date: new Date('2026-01-01T12:00:00'), expected: 'Jan 1, 2026 12:00' },
      { date: new Date('2026-02-01T12:00:00'), expected: 'Feb 1, 2026 12:00' },
      { date: new Date('2026-03-01T12:00:00'), expected: 'Mar 1, 2026 12:00' },
      { date: new Date('2026-12-31T23:59:00'), expected: 'Dec 31, 2026 23:59' },
    ];

    dates.forEach(({ date, expected }) => {
      expect(formatDate(date)).toBe(expected);
    });
  });

  it('should handle midnight correctly', () => {
    const date = new Date('2026-01-15T00:00:00');
    const formatted = formatDate(date);
    
    expect(formatted).toBe('Jan 15, 2026 00:00');
  });
});

describe('formatTime', () => {
  it('should format seconds correctly', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(30)).toBe('0:30');
    expect(formatTime(59)).toBe('0:59');
  });

  it('should format minutes and seconds', () => {
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(90)).toBe('1:30');
    expect(formatTime(330)).toBe('5:30');
  });

  it('should pad single-digit seconds', () => {
    expect(formatTime(61)).toBe('1:01');
    expect(formatTime(305)).toBe('5:05');
  });

  it('should handle large values', () => {
    expect(formatTime(600)).toBe('10:00');
    expect(formatTime(3599)).toBe('59:59');
    expect(formatTime(3661)).toBe('61:01');
  });
});

describe('cn', () => {
  it('should merge class names', () => {
    const result = cn('class1', 'class2');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', false && 'hidden', true && 'visible');
    expect(result).toContain('base');
    expect(result).toContain('visible');
    expect(result).not.toContain('hidden');
  });

  it('should merge Tailwind classes correctly', () => {
    // This tests that tailwind-merge is working
    const result = cn('p-4', 'p-2');
    // tailwind-merge should keep only the last padding class
    expect(result).toBe('p-2');
  });
});

describe('formatAddress', () => {
  it('should truncate Ethereum addresses', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    expect(formatAddress(address)).toBe('0x1234...5678');
  });

  it('should handle short addresses', () => {
    const shortAddress = '0x123';
    expect(formatAddress(shortAddress)).toBe('0x123');
  });

  it('should handle empty string', () => {
    expect(formatAddress('')).toBe('');
  });

  it('should handle undefined/null by returning as-is', () => {
    expect(formatAddress(null as unknown as string)).toBe(null);
    expect(formatAddress(undefined as unknown as string)).toBe(undefined);
  });
});

describe('formatTimestamp', () => {
  beforeEach(() => {
    // Mock Date.now() to return a fixed timestamp
    jest.spyOn(Date, 'now').mockReturnValue(1000000000000); // 2001-09-09
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return "just now" for recent timestamps', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 30; // 30 seconds ago
    expect(formatTimestamp(timestamp)).toBe('just now');
  });

  it('should format minutes correctly', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 120; // 2 minutes ago
    expect(formatTimestamp(timestamp)).toBe('2 minutes ago');
  });

  it('should handle singular minute', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 60; // 1 minute ago
    expect(formatTimestamp(timestamp)).toBe('1 minute ago');
  });

  it('should format hours correctly', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 7200; // 2 hours ago
    expect(formatTimestamp(timestamp)).toBe('2 hours ago');
  });

  it('should handle singular hour', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    expect(formatTimestamp(timestamp)).toBe('1 hour ago');
  });

  it('should format days correctly', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 172800; // 2 days ago
    expect(formatTimestamp(timestamp)).toBe('2 days ago');
  });

  it('should handle singular day', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 86400; // 1 day ago
    expect(formatTimestamp(timestamp)).toBe('1 day ago');
  });
});

describe('ipfsToGateway', () => {
  it('should convert ipfs:// URLs to gateway URLs', () => {
    const ipfsUrl = 'ipfs://QmHash123';
    const result = ipfsToGateway(ipfsUrl);
    expect(result).toContain('QmHash123');
    expect(result).toMatch(/^https?:\/\//);
  });

  it('should return HTTP URLs unchanged', () => {
    const httpUrl = 'https://example.com/image.png';
    expect(ipfsToGateway(httpUrl)).toBe(httpUrl);
  });

  it('should handle null/undefined', () => {
    expect(ipfsToGateway(null)).toBe(null);
    expect(ipfsToGateway(undefined)).toBe(null);
  });

  it('should handle empty string', () => {
    expect(ipfsToGateway('')).toBe(null);
  });

  it('should use default gateway', () => {
    const ipfsUrl = 'ipfs://QmHash456';
    const result = ipfsToGateway(ipfsUrl);
    expect(result).toBe('https://gateway.pinata.cloud/ipfs/QmHash456');
  });
});
