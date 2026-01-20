/**
 * Tests pour RarityBadge
 */

import { render, screen } from '@testing-library/react';
import { RarityBadge } from '../RarityBadge';

describe('RarityBadge', () => {
  it('devrait afficher "Common" pour tier 1', () => {
    render(<RarityBadge tier={1} />);
    expect(screen.getByText('Common')).toBeDefined();
  });

  it('devrait afficher "Uncommon" pour tier 2', () => {
    render(<RarityBadge tier={2} />);
    expect(screen.getByText('Uncommon')).toBeDefined();
  });

  it('devrait afficher "Rare" pour tier 3', () => {
    render(<RarityBadge tier={3} />);
    expect(screen.getByText('Rare')).toBeDefined();
  });

  it('devrait afficher "Legendary" pour tier 4', () => {
    render(<RarityBadge tier={4} />);
    expect(screen.getByText('Legendary')).toBeDefined();
  });

  it('devrait utiliser le style gris pour tier 1 (Common)', () => {
    const { container } = render(<RarityBadge tier={1} />);
    const badge = container.querySelector('.bg-gray-200');
    expect(badge).toBeTruthy();
  });

  it('devrait utiliser le style vert pour tier 2 (Uncommon)', () => {
    const { container } = render(<RarityBadge tier={2} />);
    const badge = container.querySelector('.bg-green-200');
    expect(badge).toBeTruthy();
  });

  it('devrait utiliser le style bleu pour tier 3 (Rare)', () => {
    const { container } = render(<RarityBadge tier={3} />);
    const badge = container.querySelector('.bg-blue-200');
    expect(badge).toBeTruthy();
  });

  it('devrait utiliser le style jaune pour tier 4 (Legendary)', () => {
    const { container } = render(<RarityBadge tier={4} />);
    const badge = container.querySelector('.bg-yellow-200');
    expect(badge).toBeTruthy();
  });

  it('devrait accepter une className personnalisée', () => {
    const { container } = render(<RarityBadge tier={1} className="custom-class" />);
    const badge = container.querySelector('.custom-class');
    expect(badge).toBeTruthy();
  });
});
