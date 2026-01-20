/**
 * Formulaire de création d'offre d'échange
 * Permet à un utilisateur de proposer un échange de cartes
 */

'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useEligibleCards } from '@/hooks/useEligibleCards';
import { useCreateOffer } from '@/hooks/useCreateOffer';
import { useCooldown } from '@/hooks/useCooldown';
import { CardSelector } from './CardSelector';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Alert } from './ui/alert';

/**
 * Composant principal du formulaire de création d'offre
 * Gère toute la logique de validation et de soumission
 */
export function CreateOfferForm() {
  const { isConnected } = useAccount();
  const { eligibleCards, hasEligibleCards, isLoading: cardsLoading } = useEligibleCards();
  const { isOnCooldown, formattedTime } = useCooldown();
  const { createOffer, isPending, isConfirmed, error, onSuccess } = useCreateOffer();

  const [selectedCard, setSelectedCard] = useState<bigint | null>(null);
  const [requestedTokenId, setRequestedTokenId] = useState('');
  const [success, setSuccess] = useState(false);

  // Déterminer si le formulaire peut être soumis
  const canSubmit =
    isConnected &&
    hasEligibleCards &&
    !isOnCooldown &&
    selectedCard !== null &&
    requestedTokenId !== '' &&
    !isPending;

  // Reset success message après confirmation
  useEffect(() => {
    if (isConfirmed) {
      setSuccess(true);
      onSuccess();
      // Reset après 5 secondes
      const timer = setTimeout(() => setSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, onSuccess]);

  /**
   * Gestionnaire de soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || selectedCard === null) return;

    try {
      await createOffer(selectedCard, BigInt(requestedTokenId));
      // Reset form
      setSelectedCard(null);
      setRequestedTokenId('');
    } catch (err) {
      // Error handled by hook
      console.error('Error creating offer:', err);
    }
  };

  /**
   * Parse les erreurs du contrat pour afficher des messages clairs
   */
  const getErrorMessage = (error: Error): string => {
    const message = error.message.toLowerCase();

    if (message.includes('cooldownactive')) {
      return 'Please wait for cooldown to expire before creating another offer.';
    }
    if (message.includes('cardlocked') || message.includes('cardislocked')) {
      return 'This card is currently locked and cannot be traded.';
    }
    if (message.includes('notowner') || message.includes('nottokenowner')) {
      return 'You do not own this card.';
    }
    if (message.includes('tokendoesnotexist')) {
      return 'The requested card does not exist.';
    }
    if (message.includes('user rejected') || message.includes('user denied')) {
      return 'Transaction was cancelled.';
    }

    return 'Failed to create offer. Please try again.';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Trade Offer</CardTitle>
        <CardDescription>Propose one of your cards in exchange for another card</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cooldown Warning */}
          {isOnCooldown && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-yellow-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-yellow-800">
                  Cooldown active. You can create another offer in {formattedTime}
                </span>
              </div>
            </Alert>
          )}

          {/* No Eligible Cards Warning */}
          {!cardsLoading && !hasEligibleCards && (
            <Alert className="bg-red-50 border-red-200">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-red-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm text-red-800">
                  You don&apos;t have any cards available for trading. All your cards may be locked.
                </span>
              </div>
            </Alert>
          )}

          {/* Step 1: Select Your Card */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Your Card (to give)
            </label>
            <CardSelector
              cards={eligibleCards}
              selectedId={selectedCard}
              onSelect={setSelectedCard}
              disabled={!hasEligibleCards || isPending}
              placeholder="Select a card to trade"
            />
          </div>

          {/* Step 2: Enter Requested Card ID */}
          <div className="space-y-2">
            <label htmlFor="requestedTokenId" className="block text-sm font-medium text-gray-700">
              Requested Card (Token ID)
            </label>
            <input
              id="requestedTokenId"
              type="number"
              min="0"
              placeholder="Enter token ID you want"
              value={requestedTokenId}
              onChange={(e) => setRequestedTokenId(e.target.value)}
              disabled={isPending}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500">Enter the token ID of the card you want to receive</p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-red-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-800">{getErrorMessage(error)}</span>
              </div>
            </Alert>
          )}

          {/* Success Message */}
          {success && isConfirmed && (
            <Alert className="bg-green-50 border-green-200">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-green-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-green-800">
                  Offer created successfully! It&apos;s now visible to other traders.
                </span>
              </div>
            </Alert>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={!canSubmit} className="w-full">
            {isPending && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isPending ? 'Creating Offer...' : 'Create Offer'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
