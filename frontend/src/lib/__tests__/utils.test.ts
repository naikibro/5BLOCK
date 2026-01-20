/**
 * Tests pour les fonctions utilitaires
 */

import { formatDate, formatTime, cn } from '../utils';

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
