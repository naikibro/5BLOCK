/**
 * Tests pour TypeBadge
 */

import { render, screen } from '@testing-library/react';
import { TypeBadge } from '../TypeBadge';

describe('TypeBadge', () => {
  it('devrait afficher le type capitalisé', () => {
    render(<TypeBadge type="electric" />);
    expect(screen.getByText('electric')).toBeDefined();
  });

  it('devrait utiliser la bonne couleur pour le type fire', () => {
    const { container } = render(<TypeBadge type="fire" />);
    const badge = container.querySelector('.bg-orange-500');
    expect(badge).toBeTruthy();
  });

  it('devrait utiliser la bonne couleur pour le type water', () => {
    const { container } = render(<TypeBadge type="water" />);
    const badge = container.querySelector('.bg-blue-500');
    expect(badge).toBeTruthy();
  });

  it('devrait utiliser une couleur par défaut pour un type inconnu', () => {
    const { container } = render(<TypeBadge type="unknown" />);
    const badge = container.querySelector('.bg-gray-500');
    expect(badge).toBeTruthy();
  });

  it('devrait accepter une className personnalisée', () => {
    const { container } = render(<TypeBadge type="grass" className="custom-class" />);
    const badge = container.querySelector('.custom-class');
    expect(badge).toBeTruthy();
  });

  it('devrait gérer les types en majuscules', () => {
    render(<TypeBadge type="PSYCHIC" />);
    expect(screen.getByText('PSYCHIC')).toBeDefined();
  });
});
