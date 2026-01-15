# US-4.2: Respecter le Lock Carte

> **Epic:** Contraintes Temporelles
> **Priorité:** Must Have
> **Complexité:** Moyenne

---

## Description

**En tant que** système,
**Je dois** empêcher l'échange d'une carte pendant 10 minutes après son acquisition,
**Afin de** stabiliser les échanges et éviter le "flipping" rapide.

---

## Critères d'acceptation

| ID | Critère | Vérifié |
|----|---------|---------|
| AC-4.2.1 | Après mint, la carte est verrouillée 10 minutes | [ ] |
| AC-4.2.2 | Après réception via échange, la carte est verrouillée 10 minutes | [ ] |
| AC-4.2.3 | Une carte verrouillée ne peut pas être proposée en échange | [ ] |
| AC-4.2.4 | Une carte verrouillée ne peut pas être utilisée pour accepter un échange | [ ] |
| AC-4.2.5 | L'UI affiche l'icône de lock et le temps restant | [ ] |
| AC-4.2.6 | Les cartes verrouillées ne sont pas listées dans le sélecteur de trade | [ ] |
| AC-4.2.7 | Le timestamp `lockUntil` est stocké on-chain | [ ] |

---

## Règles métier

### Déclenchement du lock

| Événement | Lock appliqué |
|-----------|---------------|
| `mint()` | Oui - 10 min |
| Réception via `acceptOffer()` | Oui - 10 min |
| Création d'offre | Non |
| Annulation d'offre | Non |

### Durée

```solidity
uint256 public constant LOCK_DURATION = 10 minutes; // 600 seconds
```

---

## Spécifications techniques

### Implémentation Smart Contract

```solidity
// PokemonCards.sol

struct CardMeta {
    // ...
    uint256 lockUntil;
    // ...
}

function isLocked(uint256 tokenId) public view returns (bool) {
    return block.timestamp < cards[tokenId].lockUntil;
}

function getLockUntil(uint256 tokenId) public view returns (uint256) {
    return cards[tokenId].lockUntil;
}

// Dans mint()
cards[tokenId].lockUntil = block.timestamp + LOCK_DURATION;

// Dans _update() (transfert)
if (from != address(0)) { // Not a mint
    cards[tokenId].lockUntil = block.timestamp + LOCK_DURATION;
}
```

### Hook useLockStatus

```typescript
// hooks/useLockStatus.ts
import { useReadContract } from 'wagmi';
import { useState, useEffect } from 'react';
import { pokemonCardsAbi, pokemonCardsAddress } from '@/lib/contracts';

export function useLockStatus(tokenId: bigint) {
  const [remaining, setRemaining] = useState(0);

  const { data: lockUntil, refetch } = useReadContract({
    address: pokemonCardsAddress,
    abi: pokemonCardsAbi,
    functionName: 'getLockUntil',
    args: [tokenId],
  });

  useEffect(() => {
    if (lockUntil === undefined) return;

    const now = Math.floor(Date.now() / 1000);
    const until = Number(lockUntil);
    setRemaining(Math.max(0, until - now));
  }, [lockUntil]);

  // Countdown
  useEffect(() => {
    if (remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          refetch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remaining, refetch]);

  return {
    isLocked: remaining > 0,
    remaining,
    formattedTime: formatTime(remaining),
  };
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

### Composant LockBadge

```typescript
// components/LockBadge.tsx
'use client';

import { useLockStatus } from '@/hooks/useLockStatus';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock } from 'lucide-react';

interface LockBadgeProps {
  tokenId: bigint;
  showAvailable?: boolean;
}

export function LockBadge({ tokenId, showAvailable = false }: LockBadgeProps) {
  const { isLocked, formattedTime } = useLockStatus(tokenId);

  if (isLocked) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <Lock className="h-3 w-3" />
        {formattedTime}
      </Badge>
    );
  }

  if (showAvailable) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Unlock className="h-3 w-3" />
        Available
      </Badge>
    );
  }

  return null;
}
```

---

## Interface utilisateur

### Affichage sur les cartes

```
Carte verrouillée:
┌────────────────────┐
│ [🔒 8:42]   [Rare] │
│                    │
│    [Pikachu]       │
│                    │
│ [   Locked   ]     │
└────────────────────┘

Carte disponible:
┌────────────────────┐
│ [🔓 Available]     │
│                    │
│    [Pikachu]       │
│                    │
│ [Propose Trade]    │
└────────────────────┘
```

---

## Scénarios de test

### Tests Hardhat

```typescript
describe("Lock", () => {
  it("should lock card for 10 minutes after mint", async () => {
    await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://1");

    expect(await pokemonCards.isLocked(0)).to.be.true;

    // Try to create offer
    await expect(
      tradeMarket.connect(user1).createOffer(0, 1)
    ).to.be.revertedWithCustomError(tradeMarket, "CardIsLocked");
  });

  it("should unlock card after 10 minutes", async () => {
    await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://1");
    await time.increase(10 * 60);

    expect(await pokemonCards.isLocked(0)).to.be.false;
  });

  it("should lock both cards after trade", async () => {
    // Setup and create offer
    await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://1");
    await pokemonCards.connect(user2).mint(1, 1, 143, "ipfs://2");
    await time.increase(10 * 60);

    await tradeMarket.connect(user1).createOffer(0, 1);
    await time.increase(5 * 60);

    await tradeMarket.connect(user2).acceptOffer(0);

    // Both cards should be locked
    expect(await pokemonCards.isLocked(0)).to.be.true;
    expect(await pokemonCards.isLocked(1)).to.be.true;
  });

  it("should return correct lockUntil timestamp", async () => {
    const tx = await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://1");
    const block = await ethers.provider.getBlock(tx.blockNumber!);

    const lockUntil = await pokemonCards.getLockUntil(0);
    expect(lockUntil).to.equal(block!.timestamp + 10 * 60);
  });
});
```

---

## Définition of Done

- [ ] `lockUntil` stocké dans CardMeta
- [ ] `isLocked()` et `getLockUntil()` fonctions view
- [ ] Lock appliqué sur mint et transfert
- [ ] Vérification dans TradeMarket (createOffer, acceptOffer)
- [ ] Hook `useLockStatus` avec countdown
- [ ] Composant `LockBadge` avec timer
- [ ] Cartes locked exclues du CardSelector
- [ ] Tests Hardhat complets
