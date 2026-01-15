# US-4.1: Respecter le Cooldown Wallet

> **Epic:** Contraintes Temporelles
> **Priorité:** Must Have
> **Complexité:** Moyenne

---

## Description

**En tant que** système,
**Je dois** empêcher un utilisateur d'effectuer plusieurs actions d'échange en moins de 5 minutes,
**Afin de** limiter le spam et favoriser des échanges réfléchis.

---

## Critères d'acceptation

| ID | Critère | Vérifié |
|----|---------|---------|
| AC-4.1.1 | Après `createOffer`, l'utilisateur doit attendre 5 min avant une nouvelle action | [ ] |
| AC-4.1.2 | Après `acceptOffer`, l'utilisateur doit attendre 5 min | [ ] |
| AC-4.1.3 | Après `cancelOffer`, l'utilisateur doit attendre 5 min | [ ] |
| AC-4.1.4 | Le mint n'est PAS soumis au cooldown | [ ] |
| AC-4.1.5 | Lors d'un `acceptOffer`, le cooldown s'applique aux DEUX parties (maker + taker) | [ ] |
| AC-4.1.6 | L'UI affiche le temps restant avant prochaine action | [ ] |
| AC-4.1.7 | Les boutons d'action sont désactivés pendant le cooldown | [ ] |

---

## Règles métier

### Actions soumises au cooldown

| Action | Cooldown appliqué |
|--------|-------------------|
| `mint()` | Non |
| `createOffer()` | Oui - msg.sender |
| `cancelOffer()` | Oui - msg.sender |
| `acceptOffer()` | Oui - msg.sender ET maker |

### Durée

```solidity
uint256 public constant COOLDOWN_DURATION = 5 minutes; // 300 seconds
```

---

## Spécifications techniques

### Implémentation Smart Contract

```solidity
// TradeMarket.sol

mapping(address => uint256) public lastActionAt;

modifier checkCooldown() {
    uint256 timeSince = block.timestamp - lastActionAt[msg.sender];
    if (timeSince < COOLDOWN_DURATION) {
        revert CooldownActive(msg.sender, COOLDOWN_DURATION - timeSince);
    }
    _;
    lastActionAt[msg.sender] = block.timestamp;
}

function createOffer(...) external checkCooldown { ... }
function cancelOffer(...) external checkCooldown { ... }
function acceptOffer(...) external checkCooldown {
    // ... validation
    lastActionAt[offer.maker] = block.timestamp; // Update maker too
    // ... swap
}
```

### Composant CooldownIndicator

```typescript
// components/CooldownIndicator.tsx
'use client';

import { useCooldown } from '@/hooks/useCooldown';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

export function CooldownIndicator() {
  const { isOnCooldown, formattedTime } = useCooldown();

  if (!isOnCooldown) return null;

  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      <Clock className="h-3 w-3" />
      Cooldown: {formattedTime}
    </Badge>
  );
}
```

---

## Interface utilisateur

### Affichage du cooldown

```
Header:
┌─────────────────────────────────────────────────────────────┐
│  Logo  Nav  [⏱️ Cooldown: 3:42]  0x1234...  [Disconnect]   │
└─────────────────────────────────────────────────────────────┘

Dans le formulaire de création d'offre:
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Cooldown active. You can create another offer in 3:42  │
│                                                             │
│  [       Create Offer       ] (désactivé)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Scénarios de test

### Tests Hardhat

```typescript
describe("Cooldown", () => {
  it("should revert createOffer within cooldown", async () => {
    await tradeMarket.connect(user1).createOffer(0, 1);

    await expect(
      tradeMarket.connect(user1).createOffer(1, 2)
    ).to.be.revertedWithCustomError(tradeMarket, "CooldownActive");
  });

  it("should allow createOffer after cooldown", async () => {
    await tradeMarket.connect(user1).createOffer(0, 1);
    await time.increase(5 * 60); // 5 minutes

    await expect(
      tradeMarket.connect(user1).createOffer(1, 2)
    ).to.not.be.reverted;
  });

  it("should set cooldown for both parties on acceptOffer", async () => {
    await tradeMarket.connect(user1).createOffer(0, 1);
    await time.increase(5 * 60);

    await tradeMarket.connect(user2).acceptOffer(0);

    // Both should be on cooldown
    await expect(
      tradeMarket.connect(user1).createOffer(1, 0)
    ).to.be.revertedWithCustomError(tradeMarket, "CooldownActive");

    await expect(
      tradeMarket.connect(user2).createOffer(0, 1)
    ).to.be.revertedWithCustomError(tradeMarket, "CooldownActive");
  });

  it("should return remaining cooldown time", async () => {
    await tradeMarket.connect(user1).createOffer(0, 1);
    await time.increase(2 * 60); // 2 minutes

    const remaining = await tradeMarket.getCooldownRemaining(user1.address);
    expect(remaining).to.be.closeTo(3 * 60, 5); // ~3 minutes left
  });
});
```

---

## Définition of Done

- [ ] Modifier `checkCooldown` implémenté dans TradeMarket
- [ ] `lastActionAt` mis à jour pour les deux parties sur accept
- [ ] Hook `useCooldown` avec countdown temps réel
- [ ] Composant `CooldownIndicator` visible dans l'UI
- [ ] Boutons désactivés pendant le cooldown
- [ ] Tests Hardhat complets
