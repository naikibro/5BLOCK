# US-3.3: Accepter une Offre d'Échange

> **Epic:** Marketplace d'Échange
> **Priorité:** Must Have
> **Complexité:** Élevée

---

## Description

**En tant qu'** utilisateur possédant la carte demandée,
**Je veux** accepter une offre d'échange,
**Afin de** réaliser le swap atomiquement.

---

## Contexte & Justification

L'acceptation d'une offre est le moment clé où l'échange se concrétise. En une seule transaction :
- Le taker reçoit la carte du maker
- Le maker reçoit la carte du taker
- Les deux cartes sont verrouillées 10 minutes
- L'historique de propriété est mis à jour

Le swap est **atomique** : soit les deux transferts réussissent, soit aucun.

---

## Critères d'acceptation

| ID | Critère | Vérifié |
|----|---------|---------|
| AC-3.3.1 | Le bouton "Accept" est visible sur les offres où l'utilisateur possède la carte demandée | [ ] |
| AC-3.3.2 | Le bouton est désactivé si la carte du taker est verrouillée | [ ] |
| AC-3.3.3 | Le bouton est désactivé si le cooldown de 5 min n'est pas écoulé | [ ] |
| AC-3.3.4 | Une confirmation affiche le résumé de l'échange avant signature | [ ] |
| AC-3.3.5 | La transaction est signée via MetaMask | [ ] |
| AC-3.3.6 | Après succès, les deux cartes changent de propriétaire | [ ] |
| AC-3.3.7 | Après succès, les deux cartes sont verrouillées 10 minutes | [ ] |
| AC-3.3.8 | L'event `TradeAccepted` est émis | [ ] |
| AC-3.3.9 | previousOwners est mis à jour pour les deux cartes | [ ] |
| AC-3.3.10 | Le statut de l'offre passe à "Accepted" | [ ] |
| AC-3.3.11 | En cas d'erreur, un message explicite s'affiche | [ ] |

---

## Règles métier

### Conditions pour accepter

1. **Offre ouverte** : status == Open
2. **Possession** : msg.sender possède `takerTokenId`
3. **Non verrouillée (taker)** : la carte du taker n'est pas locked
4. **Non verrouillée (maker)** : la carte du maker n'est pas locked
5. **Maker possède toujours** : le maker possède encore `makerTokenId`
6. **Cooldown** : 5 minutes depuis la dernière action du taker
7. **Limites post-swap** : aucun des deux ne dépasse 4 cartes

### Effets de l'acceptation

| Effet | Description |
|-------|-------------|
| Transfert 1 | makerTokenId : maker → taker |
| Transfert 2 | takerTokenId : taker → maker |
| Lock | Les deux cartes locked 10 min |
| Cooldown | lastActionAt mis à jour pour maker ET taker |
| Provenance | previousOwners mis à jour pour les deux |
| Offer status | Passe à "Accepted" |

---

## Spécifications techniques

### Hook useAcceptOffer

```typescript
// hooks/useAcceptOffer.ts
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { tradeMarketAbi, tradeMarketAddress } from '@/lib/contracts';

export function useAcceptOffer() {
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

  const acceptOffer = async (offerId: bigint) => {
    return await writeContractAsync({
      address: tradeMarketAddress,
      abi: tradeMarketAbi,
      functionName: 'acceptOffer',
      args: [offerId],
    });
  };

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['openOffers'] });
    queryClient.invalidateQueries({ queryKey: ['ownedCards'] });
    queryClient.invalidateQueries({ queryKey: ['cooldown'] });
  };

  return {
    acceptOffer,
    txHash,
    isPending: isWriting || isConfirming,
    isConfirmed,
    error: writeError || confirmError,
    invalidateQueries,
  };
}
```

### Composant AcceptOfferDialog

```typescript
// components/AcceptOfferDialog.tsx
'use client';

import { useState } from 'react';
import { TradeOffer } from '@/hooks/useOpenOffers';
import { useAcceptOffer } from '@/hooks/useAcceptOffer';
import { useCooldown } from '@/hooks/useCooldown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import { ArrowLeftRight, Loader2, Check, AlertCircle, Clock } from 'lucide-react';

interface AcceptOfferDialogProps {
  offer: TradeOffer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AcceptOfferDialog({ offer, open, onOpenChange }: AcceptOfferDialogProps) {
  const { acceptOffer, isPending, isConfirmed, txHash, error, invalidateQueries } = useAcceptOffer();
  const { isOnCooldown, formattedTime } = useCooldown();
  const [step, setStep] = useState<'confirm' | 'pending' | 'success' | 'error'>('confirm');

  const makerImageUrl = offer.makerCard.metadata?.image?.replace(
    'ipfs://',
    'https://gateway.pinata.cloud/ipfs/'
  );
  const takerImageUrl = offer.takerCard.metadata?.image?.replace(
    'ipfs://',
    'https://gateway.pinata.cloud/ipfs/'
  );

  const handleAccept = async () => {
    try {
      setStep('pending');
      await acceptOffer(offer.offerId);
      setStep('success');
      invalidateQueries();
    } catch (err) {
      setStep('error');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep('confirm');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Accept Trade Offer</DialogTitle>
          <DialogDescription>
            Review the trade details before accepting
          </DialogDescription>
        </DialogHeader>

        {/* Cooldown warning */}
        {isOnCooldown && step === 'confirm' && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Cooldown active. Wait {formattedTime} before accepting.
            </AlertDescription>
          </Alert>
        )}

        {/* Trade visualization */}
        <div className="py-4">
          <div className="flex items-center justify-center gap-6">
            {/* You give */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">You give</p>
              <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                {takerImageUrl && (
                  <Image
                    src={takerImageUrl}
                    alt={offer.takerCard.metadata?.name ?? 'Card'}
                    fill
                    className="object-contain p-2"
                  />
                )}
              </div>
              <p className="mt-2 text-sm font-medium">
                {offer.takerCard.metadata?.name}
              </p>
            </div>

            {/* Arrow */}
            <ArrowLeftRight className="h-6 w-6 text-muted-foreground" />

            {/* You receive */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">You receive</p>
              <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                {makerImageUrl && (
                  <Image
                    src={makerImageUrl}
                    alt={offer.makerCard.metadata?.name ?? 'Card'}
                    fill
                    className="object-contain p-2"
                  />
                )}
              </div>
              <p className="mt-2 text-sm font-medium">
                {offer.makerCard.metadata?.name}
              </p>
            </div>
          </div>

          {/* Lock warning */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Both cards will be locked for 10 minutes after the trade.
          </p>
        </div>

        {/* Status messages */}
        {step === 'pending' && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Confirm the transaction in MetaMask...
            </AlertDescription>
          </Alert>
        )}

        {step === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Trade completed successfully! Check your inventory.
              {txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-500 hover:underline mt-1"
                >
                  View transaction
                </a>
              )}
            </AlertDescription>
          </Alert>
        )}

        {step === 'error' && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {getErrorMessage(error)}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          {step === 'confirm' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleAccept} disabled={isPending || isOnCooldown}>
                Accept Trade
              </Button>
            </>
          )}

          {(step === 'success' || step === 'error') && (
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes('cooldownactive')) {
    return 'Please wait for cooldown to expire.';
  }
  if (message.includes('cardislocked')) {
    return 'One of the cards is currently locked.';
  }
  if (message.includes('offernotopen')) {
    return 'This offer is no longer available.';
  }
  if (message.includes('nottokenowner') || message.includes('notowner')) {
    return 'You do not own the requested card.';
  }
  if (message.includes('makernolongerownstoken')) {
    return 'The maker no longer owns their card.';
  }
  if (message.includes('user rejected') || message.includes('user denied')) {
    return 'Transaction was cancelled.';
  }

  return 'Failed to accept offer. Please try again.';
}
```

---

## Interface utilisateur

### Dialog de confirmation

```
┌─────────────────────────────────────────────┐
│  Accept Trade Offer                     [X] │
│  Review the trade details before accepting  │
├─────────────────────────────────────────────┤
│                                             │
│      You give         ↔️        You receive │
│     ┌───────┐              ┌───────┐       │
│     │ 🖼️    │              │ 🖼️    │       │
│     │Bulba  │              │Pika   │       │
│     └───────┘              └───────┘       │
│     Bulbasaur              Pikachu          │
│                                             │
│  Both cards will be locked for 10 minutes   │
│  after the trade.                           │
│                                             │
├─────────────────────────────────────────────┤
│          [Cancel]    [Accept Trade]         │
└─────────────────────────────────────────────┘
```

### États de la dialog

| État | Affichage |
|------|-----------|
| Confirm | Récapitulatif + boutons Cancel/Accept |
| Pending | Spinner + "Confirm in MetaMask" |
| Success | Check vert + lien transaction |
| Error | Message d'erreur + bouton Close |

---

## Gestion des erreurs

| Erreur contrat | Message UI |
|----------------|------------|
| `CooldownActive` | "Please wait for cooldown to expire." |
| `CardIsLocked` | "One of the cards is currently locked." |
| `OfferNotOpen` | "This offer is no longer available." |
| `NotTokenOwner` | "You do not own the requested card." |
| `MakerNoLongerOwnsToken` | "The maker no longer owns their card." |
| User rejected | "Transaction was cancelled." |

---

## Scénarios de test

### Tests manuels

| # | Scénario | Étapes | Résultat attendu |
|---|----------|--------|------------------|
| 1 | Acceptation réussie | 1. Cliquer Accept 2. Confirmer | Cartes échangées |
| 2 | Cooldown actif | 1. Accepter offre 2. Tenter d'accepter autre | Refusé + timer |
| 3 | Ma carte locked | 1. Juste minté 2. Tenter d'accepter | Bouton désactivé |
| 4 | Maker a vendu | 1. Maker échange sa carte 2. Tenter d'accepter | "Maker no longer owns" |
| 5 | Offre déjà acceptée | 1. Autre user accepte avant 2. Tenter | "Offer not open" |
| 6 | Transaction annulée | 1. Accept 2. Rejeter MetaMask | Message "cancelled" |

### Tests Hardhat

```typescript
describe("Accept Offer", () => {
  beforeEach(async () => {
    // Setup: user1 and user2 each have a card, unlocked
    await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://1");
    await pokemonCards.connect(user2).mint(1, 1, 143, "ipfs://2");
    await time.increase(10 * 60); // Wait for lock

    // user1 creates offer: card 0 for card 1
    await tradeMarket.connect(user1).createOffer(0, 1);
    await time.increase(5 * 60); // Wait for cooldown
  });

  it("should swap cards atomically", async () => {
    await tradeMarket.connect(user2).acceptOffer(0);

    expect(await pokemonCards.ownerOf(0)).to.equal(user2.address);
    expect(await pokemonCards.ownerOf(1)).to.equal(user1.address);
  });

  it("should lock both cards after swap", async () => {
    await tradeMarket.connect(user2).acceptOffer(0);

    expect(await pokemonCards.isLocked(0)).to.be.true;
    expect(await pokemonCards.isLocked(1)).to.be.true;
  });

  it("should update previousOwners", async () => {
    await tradeMarket.connect(user2).acceptOffer(0);

    const prev0 = await pokemonCards.getPreviousOwners(0);
    const prev1 = await pokemonCards.getPreviousOwners(1);

    expect(prev0).to.include(user1.address);
    expect(prev1).to.include(user2.address);
  });

  it("should update cooldown for both users", async () => {
    await tradeMarket.connect(user2).acceptOffer(0);

    // Both should be on cooldown
    await expect(
      tradeMarket.connect(user1).createOffer(1, 0)
    ).to.be.revertedWithCustomError(tradeMarket, "CooldownActive");

    await expect(
      tradeMarket.connect(user2).createOffer(0, 1)
    ).to.be.revertedWithCustomError(tradeMarket, "CooldownActive");
  });

  it("should revert if taker card is locked", async () => {
    // user2 mints new card (locked)
    await pokemonCards.connect(user2).mint(4, 1, 100, "ipfs://3");

    // Create offer for the locked card
    await time.increase(5 * 60);
    await tradeMarket.connect(user1).createOffer(0, 2);

    await time.increase(5 * 60);
    // Card 2 is still locked
    await expect(
      tradeMarket.connect(user2).acceptOffer(1)
    ).to.be.revertedWithCustomError(tradeMarket, "CardIsLocked");
  });

  it("should revert if maker no longer owns card", async () => {
    // user1 transfers card to user3
    await pokemonCards.connect(user1).transferFrom(user1.address, user3.address, 0);

    await time.increase(5 * 60);
    await expect(
      tradeMarket.connect(user2).acceptOffer(0)
    ).to.be.revertedWithCustomError(tradeMarket, "MakerNoLongerOwnsToken");
  });
});
```

---

## Dépendances

### Dépendances fonctionnelles
- US-3.1 (Create Offer) - une offre doit exister
- US-3.2 (View Offers) - pour voir et cliquer Accept

### Bloque
- US-6.1 (History) - l'event TradeAccepted apparaît dans l'historique

---

## Définition of Done

- [ ] Hook `useAcceptOffer` fonctionnel
- [ ] Composant `AcceptOfferDialog` avec récapitulatif
- [ ] Gestion des erreurs avec messages clairs
- [ ] Mise à jour automatique des queries après succès
- [ ] Tests Hardhat complets
- [ ] Tests manuels passés
- [ ] Vérification du lock post-échange
- [ ] Vérification du previousOwners
