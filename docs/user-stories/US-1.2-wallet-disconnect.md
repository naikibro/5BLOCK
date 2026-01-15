# US-1.2: Déconnexion Wallet

> **Epic:** Gestion du Wallet
> **Priorité:** Must Have
> **Complexité:** Très faible

---

## Description

**En tant qu'** utilisateur connecté,
**Je veux** pouvoir déconnecter mon wallet,
**Afin de** sécuriser ma session ou changer de compte.

---

## Contexte & Justification

La déconnexion permet à l'utilisateur de :
- **Sécuriser sa session** sur un ordinateur partagé
- **Changer de wallet** pour utiliser un autre compte
- **Tester** avec différentes adresses en développement

La déconnexion est une bonne pratique UX et de sécurité dans les DApps.

---

## Critères d'acceptation

| ID | Critère | Vérifié |
|----|---------|---------|
| AC-1.2.1 | Un bouton "Disconnect" est visible quand un wallet est connecté | [ ] |
| AC-1.2.2 | Au clic sur "Disconnect", la session wallet est terminée | [ ] |
| AC-1.2.3 | Après déconnexion, l'UI revient à l'état "non connecté" (bouton "Connect Wallet") | [ ] |
| AC-1.2.4 | Les données en cache liées au wallet (inventaire, offres) sont nettoyées | [ ] |
| AC-1.2.5 | Si sur une page protégée (/inventory, /trade), redirection vers la home | [ ] |

---

## Règles métier

1. **Instantané** : La déconnexion doit être immédiate (pas de confirmation)
2. **Cache** : Les queries react-query liées à l'adresse doivent être invalidées
3. **État UI** : Tous les composants dépendant de l'adresse doivent se réinitialiser

---

## Spécifications techniques

### Hook wagmi

```typescript
import { useDisconnect } from 'wagmi';

const { disconnect, isPending, error } = useDisconnect();

// Appel simple
disconnect();

// Avec callback
disconnect(undefined, {
  onSuccess: () => {
    // Nettoyage cache, redirection, etc.
  },
});
```

### Invalidation du cache

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const handleDisconnect = () => {
  disconnect();
  // Invalider toutes les queries liées au wallet
  queryClient.invalidateQueries({ queryKey: ['ownedCards'] });
  queryClient.invalidateQueries({ queryKey: ['userOffers'] });
};
```

### Protection des routes

```typescript
// hooks/useRequireWallet.ts
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useRequireWallet() {
  const { isConnected, isDisconnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isDisconnected) {
      router.push('/');
    }
  }, [isDisconnected, router]);

  return { isConnected };
}
```

### Composant mise à jour

```typescript
// components/WalletConnect.tsx (extrait)
export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const queryClient = useQueryClient();

  const handleDisconnect = () => {
    disconnect();
    queryClient.clear(); // Nettoie tout le cache
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <span className="font-mono text-sm">{formatAddress(address)}</span>
        <Button variant="outline" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  // ... reste du composant
}
```

---

## Interface utilisateur

### Placement du bouton

Le bouton "Disconnect" apparaît dans le header, à côté de l'adresse affichée.

```
┌─────────────────────────────────────────────────────────┐
│  Header                                                  │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Logo     Nav Links    0x1234...abcd [Disconnect]  ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Style du bouton

- Variante `outline` (moins proéminent que le bouton Connect)
- Pas d'icône nécessaire
- Hover state : légère mise en évidence

---

## Scénarios de test

| # | Scénario | Étapes | Résultat attendu |
|---|----------|--------|------------------|
| 1 | Déconnexion basique | 1. Être connecté 2. Cliquer "Disconnect" | Retour à l'état non connecté |
| 2 | Cache nettoyé | 1. Voir son inventaire 2. Déconnecter 3. Reconnecter autre compte | Inventaire du nouveau compte |
| 3 | Redirection | 1. Être sur /inventory 2. Déconnecter | Redirigé vers / |
| 4 | Reconnexion | 1. Déconnecter 2. Reconnecter même compte | Session restaurée |

---

## Dépendances

### Dépendances fonctionnelles
- US-1.1 (Connexion Wallet) - doit être connecté pour pouvoir déconnecter

### Bloque
- Aucune user story directement

---

## Notes de développement

### Différence wagmi disconnect vs MetaMask

- `wagmi.disconnect()` : Déconnecte de l'application (state wagmi)
- MetaMask reste connecté au site (permission donnée)
- Pour une vraie révocation, l'utilisateur doit aller dans MetaMask > Connected sites

### Comportement attendu

```typescript
// Avant déconnexion
isConnected: true
address: "0x1234..."

// Après déconnexion
isConnected: false
address: undefined
```

---

## Définition of Done

- [ ] Bouton Disconnect fonctionnel
- [ ] Cache react-query invalidé à la déconnexion
- [ ] Redirection depuis pages protégées
- [ ] Tests manuels passés
- [ ] Intégré avec US-1.1
