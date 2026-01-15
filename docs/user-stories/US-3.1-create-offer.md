# US-3.1: Créer une Offre d'Échange

> **Epic:** Marketplace d'Échange
> **Priorité:** Must Have
> **Complexité:** Élevée

---

## Description

**En tant qu'** utilisateur connecté possédant au moins une carte,
**Je veux** créer une offre d'échange,
**Afin de** proposer un swap avec d'autres utilisateurs.

---

## Contexte & Justification

La création d'offre est le point de départ du système d'échange. L'utilisateur spécifie :
- **Ma carte** : celle qu'il est prêt à donner
- **La carte souhaitée** : celle qu'il veut recevoir en échange

L'offre est stockée on-chain et visible par tous. N'importe qui possédant la carte demandée peut l'accepter.

---

## Critères d'acceptation

| ID | Critère | Vérifié |
|----|---------|---------|
| AC-3.1.1 | La page `/trade` contient un formulaire de création d'offre | [ ] |
| AC-3.1.2 | L'utilisateur peut sélectionner une de ses cartes (non verrouillée) | [ ] |
| AC-3.1.3 | L'utilisateur peut spécifier la carte souhaitée (par tokenId ou sélection) | [ ] |
| AC-3.1.4 | Le formulaire est désactivé si l'utilisateur n'a aucune carte éligible | [ ] |
| AC-3.1.5 | La validation vérifie que la carte proposée n'est pas verrouillée | [ ] |
| AC-3.1.6 | La validation vérifie le cooldown de 5 minutes | [ ] |
| AC-3.1.7 | La transaction est signée via MetaMask | [ ] |
| AC-3.1.8 | Après succès, l'offre apparaît dans la liste des offres ouvertes | [ ] |
| AC-3.1.9 | Un event `TradeCreated` est émis et affiché | [ ] |
| AC-3.1.10 | En cas d'erreur, un message explicite s'affiche | [ ] |

---

## Règles métier

### Conditions pour créer une offre

1. **Wallet connecté** : l'utilisateur doit être authentifié
2. **Possession** : l'utilisateur doit posséder `makerTokenId`
3. **Non verrouillée** : la carte proposée ne doit pas être locked
4. **Cooldown** : 5 minutes depuis la dernière action d'échange
5. **Carte cible existe** : `takerTokenId` doit être un token valide

### Données de l'offre créée

| Champ | Valeur |
|-------|--------|
| offerId | Auto-généré (counter) |
| maker | msg.sender |
| makerTokenId | Carte proposée |
| takerTokenId | Carte demandée |
| status | Open |
| createdAt | block.timestamp |

---

## Spécifications techniques

### Hook useCreateOffer

```typescript
// hooks/useCreateOffer.ts
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { tradeMarketAbi, tradeMarketAddress } from '@/lib/contracts';

export function useCreateOffer() {
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

  const createOffer = async (makerTokenId: bigint, takerTokenId: bigint) => {
    const hash = await writeContractAsync({
      address: tradeMarketAddress,
      abi: tradeMarketAbi,
      functionName: 'createOffer',
      args: [makerTokenId, takerTokenId],
    });

    return hash;
  };

  const onSuccess = () => {
    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ['openOffers'] });
    queryClient.invalidateQueries({ queryKey: ['myOffers'] });
    queryClient.invalidateQueries({ queryKey: ['cooldown'] });
  };

  return {
    createOffer,
    txHash,
    isPending: isWriting || isConfirming,
    isConfirmed,
    error: writeError || confirmError,
    onSuccess,
  };
}
```

### Hook useCooldown

```typescript
// hooks/useCooldown.ts
import { useReadContract } from 'wagmi';
import { useAccount } from 'wagmi';
import { tradeMarketAbi, tradeMarketAddress } from '@/lib/contracts';
import { useState, useEffect } from 'react';

export function useCooldown() {
  const { address } = useAccount();
  const [remaining, setRemaining] = useState(0);

  const { data: cooldownRemaining, refetch } = useReadContract({
    address: tradeMarketAddress,
    abi: tradeMarketAbi,
    functionName: 'getCooldownRemaining',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  useEffect(() => {
    if (cooldownRemaining !== undefined) {
      setRemaining(Number(cooldownRemaining));
    }
  }, [cooldownRemaining]);

  // Countdown effect
  useEffect(() => {
    if (remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          refetch(); // Refresh from chain when done
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remaining, refetch]);

  return {
    remaining,
    isOnCooldown: remaining > 0,
    formattedTime: formatCooldown(remaining),
  };
}

function formatCooldown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

### Hook useEligibleCards

```typescript
// hooks/useEligibleCards.ts
import { useOwnedCards } from './useOwnedCards';

export function useEligibleCards() {
  const { cards, isLoading } = useOwnedCards();

  // Filter cards that can be traded (not locked)
  const eligibleCards = cards.filter(card => !card.isLocked);

  return {
    eligibleCards,
    lockedCards: cards.filter(card => card.isLocked),
    hasEligibleCards: eligibleCards.length > 0,
    isLoading,
  };
}
```

### Composant CreateOfferForm

```typescript
// components/CreateOfferForm.tsx
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useEligibleCards } from '@/hooks/useEligibleCards';
import { useCreateOffer } from '@/hooks/useCreateOffer';
import { useCooldown } from '@/hooks/useCooldown';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CardSelector } from './CardSelector';
import { Loader2, AlertCircle, Clock, Check } from 'lucide-react';

export function CreateOfferForm() {
  const { isConnected } = useAccount();
  const { isSupported } = useNetworkStatus();
  const { eligibleCards, hasEligibleCards, isLoading: cardsLoading } = useEligibleCards();
  const { isOnCooldown, formattedTime } = useCooldown();
  const { createOffer, isPending, isConfirmed, error, onSuccess } = useCreateOffer();

  const [selectedCard, setSelectedCard] = useState<bigint | null>(null);
  const [requestedTokenId, setRequestedTokenId] = useState('');
  const [success, setSuccess] = useState(false);

  const canSubmit =
    isConnected &&
    isSupported &&
    hasEligibleCards &&
    !isOnCooldown &&
    selectedCard !== null &&
    requestedTokenId !== '' &&
    !isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || selectedCard === null) return;

    try {
      await createOffer(selectedCard, BigInt(requestedTokenId));
      setSuccess(true);
      onSuccess();
      // Reset form
      setSelectedCard(null);
      setRequestedTokenId('');
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Trade Offer</CardTitle>
        <CardDescription>
          Propose one of your cards in exchange for another card
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cooldown Warning */}
          {isOnCooldown && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Cooldown active. You can create another offer in {formattedTime}
              </AlertDescription>
            </Alert>
          )}

          {/* No eligible cards warning */}
          {!cardsLoading && !hasEligibleCards && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You don't have any cards available for trading.
                {eligibleCards.length === 0 && ' All your cards may be locked.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Step 1: Select your card */}
          <div className="space-y-2">
            <Label>Your Card (to give)</Label>
            <CardSelector
              cards={eligibleCards}
              selectedId={selectedCard}
              onSelect={setSelectedCard}
              disabled={!hasEligibleCards || isPending}
              placeholder="Select a card to trade"
            />
          </div>

          {/* Step 2: Enter requested card ID */}
          <div className="space-y-2">
            <Label htmlFor="requestedTokenId">Requested Card (Token ID)</Label>
            <Input
              id="requestedTokenId"
              type="number"
              min="0"
              placeholder="Enter token ID you want"
              value={requestedTokenId}
              onChange={(e) => setRequestedTokenId(e.target.value)}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Enter the token ID of the card you want to receive
            </p>
          </div>

          {/* Error display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {getErrorMessage(error)}
              </AlertDescription>
            </Alert>
          )}

          {/* Success message */}
          {success && isConfirmed && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Offer created successfully! It's now visible to other traders.
              </AlertDescription>
            </Alert>
          )}

          {/* Submit button */}
          <Button type="submit" disabled={!canSubmit} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Creating Offer...' : 'Create Offer'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function getErrorMessage(error: Error): string {
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
  if (message.includes('user rejected') || message.includes('user denied')) {
    return 'Transaction was cancelled.';
  }

  return 'Failed to create offer. Please try again.';
}
```

### Composant CardSelector

```typescript
// components/CardSelector.tsx
'use client';

import { OwnedCard } from '@/hooks/useOwnedCards';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';

interface CardSelectorProps {
  cards: OwnedCard[];
  selectedId: bigint | null;
  onSelect: (id: bigint | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CardSelector({
  cards,
  selectedId,
  onSelect,
  disabled,
  placeholder = 'Select a card',
}: CardSelectorProps) {
  return (
    <Select
      value={selectedId?.toString() ?? ''}
      onValueChange={(value) => onSelect(value ? BigInt(value) : null)}
      disabled={disabled || cards.length === 0}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {cards.map((card) => {
          const imageUrl = card.metadata?.image?.replace(
            'ipfs://',
            'https://gateway.pinata.cloud/ipfs/'
          );

          return (
            <SelectItem key={card.tokenId.toString()} value={card.tokenId.toString()}>
              <div className="flex items-center gap-3">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={card.metadata?.name ?? 'Card'}
                    width={32}
                    height={32}
                    className="rounded"
                  />
                )}
                <div>
                  <div className="font-medium">
                    {card.metadata?.name ?? `Card #${card.tokenId}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Value: {card.value}
                  </div>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
```

---

## Interface utilisateur

### Formulaire de création

```
┌─────────────────────────────────────────────────────────────┐
│  Create Trade Offer                                          │
│  Propose one of your cards in exchange for another card      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ⏱️ Cooldown active. You can create another offer in 3:42   │
│                                                              │
│  Your Card (to give)                                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [🖼️ Pikachu] Pikachu #25 - Value: 130       ▼     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Requested Card (Token ID)                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  5                                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│  Enter the token ID of the card you want to receive          │
│                                                              │
│  [          Create Offer          ]                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### États du formulaire

| État | Affichage |
|------|-----------|
| Pas connecté | Formulaire désactivé + "Connect wallet" |
| Cooldown actif | Banner jaune avec countdown |
| Pas de cartes | Alert "No eligible cards" |
| Toutes locked | Alert "All cards locked" |
| Succès | Alert vert "Offer created!" |
| Erreur | Alert rouge avec message |

---

## Gestion des erreurs

| Erreur contrat | Message UI |
|----------------|------------|
| `CooldownActive` | "Please wait for cooldown to expire." |
| `CardIsLocked` | "This card is currently locked." |
| `NotTokenOwner` | "You do not own this card." |
| `TokenDoesNotExist` | "The requested card does not exist." |
| User rejected | "Transaction was cancelled." |

---

## Scénarios de test

### Tests manuels

| # | Scénario | Étapes | Résultat attendu |
|---|----------|--------|------------------|
| 1 | Création réussie | 1. Sélectionner carte 2. Entrer tokenId 3. Submit | Offre créée, liste màj |
| 2 | Cooldown actif | 1. Créer offre 2. Tenter de créer immédiatement | Bouton désactivé + timer |
| 3 | Carte locked | 1. Mint 2. Tenter de créer offre | Carte non listée dans selector |
| 4 | TokenId invalide | 1. Entrer tokenId 9999 | Revert "TokenDoesNotExist" |
| 5 | Transaction annulée | 1. Submit 2. Rejeter dans MetaMask | Message "cancelled" |

### Tests Hardhat

```typescript
describe("Create Offer", () => {
  it("should create offer successfully", async () => {
    // Mint cards first
    await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://1");
    await pokemonCards.connect(user2).mint(1, 1, 143, "ipfs://2");

    // Wait for lock to expire
    await time.increase(10 * 60);

    // Create offer
    await expect(tradeMarket.connect(user1).createOffer(0, 1))
      .to.emit(tradeMarket, "TradeCreated")
      .withArgs(0, user1.address, 0, 1);

    const offer = await tradeMarket.getOffer(0);
    expect(offer.maker).to.equal(user1.address);
    expect(offer.status).to.equal(0); // Open
  });

  it("should revert if card is locked", async () => {
    await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://1");
    // Don't wait for lock

    await expect(
      tradeMarket.connect(user1).createOffer(0, 1)
    ).to.be.revertedWithCustomError(tradeMarket, "CardIsLocked");
  });

  it("should revert if on cooldown", async () => {
    await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://1");
    await pokemonCards.connect(user1).mint(1, 1, 143, "ipfs://2");
    await time.increase(10 * 60); // Wait for lock

    await tradeMarket.connect(user1).createOffer(0, 1);

    // Try to create another immediately
    await expect(
      tradeMarket.connect(user1).createOffer(1, 0)
    ).to.be.revertedWithCustomError(tradeMarket, "CooldownActive");
  });
});
```

---

## Dépendances

### Dépendances fonctionnelles
- US-1.1 (Wallet Connect)
- US-2.2 (Mint) - doit avoir des cartes
- US-2.3 (Inventory) - pour voir ses cartes

### Dépendances techniques
- Contrat `TradeMarket.sol` déployé
- Contrat `PokemonCards.sol` avec `setTradeMarket` configuré

### Bloque
- US-3.2 (View Offers) - l'offre doit apparaître
- US-3.3 (Accept Offer) - l'offre peut être acceptée
- US-3.4 (Cancel Offer) - le maker peut annuler

---

## Définition of Done

- [ ] Hook `useCreateOffer` fonctionnel
- [ ] Hook `useCooldown` avec countdown
- [ ] Hook `useEligibleCards` filtrant les locked
- [ ] Composant `CreateOfferForm` complet
- [ ] Composant `CardSelector` avec preview
- [ ] Gestion des erreurs avec messages clairs
- [ ] Tests Hardhat pour createOffer
- [ ] Tests manuels passés
