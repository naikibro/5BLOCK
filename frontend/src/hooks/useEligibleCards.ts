/**
 * Hook pour obtenir les cartes éligibles au trading
 * Filtre les cartes possédées pour exclure celles qui sont verrouillées
 */

'use client';

import { useOwnedCards } from './useOwnedCards';
import type { OwnedCard } from '@/types/pokemon';

export interface UseEligibleCardsReturn {
  eligibleCards: OwnedCard[]; // Cartes non verrouillées
  lockedCards: OwnedCard[]; // Cartes verrouillées
  hasEligibleCards: boolean; // Au moins une carte éligible
  isLoading: boolean;
}

/**
 * Hook pour filtrer les cartes éligibles au trading
 * Retourne seulement les cartes qui ne sont PAS verrouillées
 * @returns Cartes éligibles et statut de chargement
 */
export function useEligibleCards(): UseEligibleCardsReturn {
  const { cards, isLoading } = useOwnedCards();

  // Filtrer les cartes qui peuvent être échangées (non verrouillées)
  const eligibleCards = cards.filter((card) => !card.isLocked);
  const lockedCards = cards.filter((card) => card.isLocked);

  return {
    eligibleCards,
    lockedCards,
    hasEligibleCards: eligibleCards.length > 0,
    isLoading,
  };
}
