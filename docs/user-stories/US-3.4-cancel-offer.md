# US-3.4: Annuler une Offre d'Échange

> **Epic:** Marketplace d'Échange
> **Priorité:** Must Have
> **Complexité:** Faible

---

## Description

**En tant que** créateur d'une offre,
**Je veux** pouvoir annuler mon offre,
**Afin de** retirer ma carte du marketplace si je change d'avis.

---

## Critères d'acceptation

| ID | Critère | Vérifié |
|----|---------|---------|
| AC-3.4.1 | Un bouton "Cancel" est visible sur mes offres ouvertes | [ ] |
| AC-3.4.2 | Seul le maker (créateur) peut annuler une offre | [ ] |
| AC-3.4.3 | La validation vérifie le cooldown de 5 minutes | [ ] |
| AC-3.4.4 | Une confirmation est demandée avant annulation | [ ] |
| AC-3.4.5 | Après succès, l'offre passe en statut "Cancelled" | [ ] |
| AC-3.4.6 | L'event `TradeCancelled` est émis | [ ] |
| AC-3.4.7 | L'offre disparaît de la liste des offres ouvertes | [ ] |

---

## Spécifications techniques

### Hook useCancelOffer

```typescript
// hooks/useCancelOffer.ts
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { tradeMarketAbi, tradeMarketAddress } from '@/lib/contracts';

export function useCancelOffer() {
  const queryClient = useQueryClient();

  const {
    writeContractAsync,
    data: txHash,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const cancelOffer = async (offerId: bigint) => {
    return await writeContractAsync({
      address: tradeMarketAddress,
      abi: tradeMarketAbi,
      functionName: 'cancelOffer',
      args: [offerId],
    });
  };

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['openOffers'] });
    queryClient.invalidateQueries({ queryKey: ['myOffers'] });
    queryClient.invalidateQueries({ queryKey: ['cooldown'] });
  };

  return {
    cancelOffer,
    txHash,
    isPending: isWriting || isConfirming,
    isConfirmed,
    error: writeError || confirmError,
    invalidateQueries,
  };
}
```

### Composant CancelOfferDialog

```typescript
// components/CancelOfferDialog.tsx
'use client';

import { useState } from 'react';
import { TradeOffer } from '@/hooks/useOpenOffers';
import { useCancelOffer } from '@/hooks/useCancelOffer';
import { useCooldown } from '@/hooks/useCooldown';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, AlertCircle, Clock } from 'lucide-react';

interface CancelOfferDialogProps {
  offer: TradeOffer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelOfferDialog({ offer, open, onOpenChange }: CancelOfferDialogProps) {
  const { cancelOffer, isPending, isConfirmed, error, invalidateQueries } = useCancelOffer();
  const { isOnCooldown, formattedTime } = useCooldown();
  const [success, setSuccess] = useState(false);

  const handleCancel = async () => {
    try {
      await cancelOffer(offer.offerId);
      setSuccess(true);
      invalidateQueries();
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSuccess(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Trade Offer?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this offer?
            Your card will remain in your inventory.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Cooldown warning */}
        {isOnCooldown && !success && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Cooldown active. Wait {formattedTime} before cancelling.
            </AlertDescription>
          </Alert>
        )}

        {/* Success */}
        {success && isConfirmed && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Offer cancelled successfully.
            </AlertDescription>
          </Alert>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {getErrorMessage(error)}
            </AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          {!success ? (
            <>
              <AlertDialogCancel disabled={isPending}>
                Keep Offer
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancel}
                disabled={isPending || isOnCooldown}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cancel Offer
              </AlertDialogAction>
            </>
          ) : (
            <AlertDialogAction onClick={handleClose}>
              Close
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function getErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes('cooldownactive')) {
    return 'Please wait for cooldown to expire.';
  }
  if (message.includes('notoffermaker') || message.includes('notmaker')) {
    return 'Only the offer creator can cancel.';
  }
  if (message.includes('offernotopen')) {
    return 'This offer is no longer open.';
  }
  if (message.includes('user rejected')) {
    return 'Transaction was cancelled.';
  }

  return 'Failed to cancel offer. Please try again.';
}
```

---

## Interface utilisateur

### Dialog de confirmation

```
┌─────────────────────────────────────────────┐
│  Cancel Trade Offer?                        │
│                                             │
│  Are you sure you want to cancel this       │
│  offer? Your card will remain in your       │
│  inventory.                                 │
│                                             │
├─────────────────────────────────────────────┤
│        [Keep Offer]    [Cancel Offer]       │
└─────────────────────────────────────────────┘
```

---

## Scénarios de test

| # | Scénario | Étapes | Résultat attendu |
|---|----------|--------|------------------|
| 1 | Annulation réussie | 1. Cliquer Cancel 2. Confirmer | Offre supprimée |
| 2 | Cooldown actif | 1. Créer offre 2. Annuler immédiatement | Refusé + timer |
| 3 | Non propriétaire | 1. Autre user tente d'annuler | "Only creator can cancel" |
| 4 | Déjà acceptée | 1. Offre acceptée 2. Tenter d'annuler | "Offer not open" |

### Tests Hardhat

```typescript
describe("Cancel Offer", () => {
  it("should cancel offer successfully", async () => {
    await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://1");
    await time.increase(10 * 60);

    await tradeMarket.connect(user1).createOffer(0, 1);
    await time.increase(5 * 60);

    await expect(tradeMarket.connect(user1).cancelOffer(0))
      .to.emit(tradeMarket, "TradeCancelled")
      .withArgs(0);

    const offer = await tradeMarket.getOffer(0);
    expect(offer.status).to.equal(1); // Cancelled
  });

  it("should revert if not maker", async () => {
    await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://1");
    await time.increase(10 * 60);
    await tradeMarket.connect(user1).createOffer(0, 1);
    await time.increase(5 * 60);

    await expect(
      tradeMarket.connect(user2).cancelOffer(0)
    ).to.be.revertedWithCustomError(tradeMarket, "NotOfferMaker");
  });
});
```

---

## Dépendances

- US-3.1 (Create Offer)
- US-3.2 (View Offers)

---

## Définition of Done

- [ ] Hook `useCancelOffer` fonctionnel
- [ ] Composant `CancelOfferDialog` avec confirmation
- [ ] Gestion des erreurs
- [ ] Tests Hardhat
- [ ] Tests manuels passés
