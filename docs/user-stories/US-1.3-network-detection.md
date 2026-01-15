# US-1.3: Détection et Changement de Réseau

> **Epic:** Gestion du Wallet
> **Priorité:** Should Have
> **Complexité:** Faible

---

## Description

**En tant qu'** utilisateur,
**Je veux** être averti si je suis sur le mauvais réseau blockchain,
**Afin d'** éviter des erreurs de transaction et utiliser la DApp correctement.

---

## Contexte & Justification

Les smart contracts sont déployés sur un réseau spécifique (Sepolia testnet ou Hardhat local). Si l'utilisateur est connecté sur le mauvais réseau (ex: Ethereum Mainnet), les interactions échoueront car :

- Les contrats n'existent pas à cette adresse sur l'autre réseau
- Les transactions seront rejetées ou perdues

La détection automatique du réseau et la possibilité de switch améliore drastiquement l'UX.

---

## Critères d'acceptation

| ID | Critère | Vérifié |
|----|---------|---------|
| AC-1.3.1 | Le réseau actuel est affiché dans l'UI (badge ou texte) | [ ] |
| AC-1.3.2 | Si l'utilisateur est sur un réseau non supporté, un warning visible s'affiche | [ ] |
| AC-1.3.3 | Un bouton "Switch Network" permet de demander le changement via MetaMask | [ ] |
| AC-1.3.4 | Après switch réussi, le warning disparaît et l'UI se met à jour | [ ] |
| AC-1.3.5 | Les interactions contrat sont bloquées tant que le mauvais réseau est actif | [ ] |
| AC-1.3.6 | Si l'utilisateur change de réseau dans MetaMask, l'UI se met à jour automatiquement | [ ] |

---

## Réseaux supportés

| Réseau | Chain ID | Usage | Priorité |
|--------|----------|-------|----------|
| Hardhat Local | 31337 | Développement | Must |
| Sepolia Testnet | 11155111 | Tests & Demo | Must |
| Ethereum Mainnet | 1 | Non supporté | - |

---

## Règles métier

1. **Blocking** : Sur mauvais réseau, les boutons d'action (Mint, Trade) doivent être désactivés
2. **Non-intrusif** : Le warning ne doit pas bloquer toute l'UI, juste les actions on-chain
3. **Automatique** : Le changement de réseau dans MetaMask doit être détecté en temps réel

---

## Spécifications techniques

### Hooks wagmi

```typescript
import { useChainId, useSwitchChain, useAccount } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';

// Chain ID actuel
const chainId = useChainId();

// Switch de chain
const { switchChain, isPending, error } = useSwitchChain();

// Chains configurées
const supportedChainIds = [sepolia.id, hardhat.id]; // [11155111, 31337]
```

### Vérification du réseau

```typescript
// hooks/useNetworkStatus.ts
import { useChainId } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';

const SUPPORTED_CHAINS = [sepolia, hardhat];
const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map(c => c.id);

export function useNetworkStatus() {
  const chainId = useChainId();

  const isSupported = SUPPORTED_CHAIN_IDS.includes(chainId);
  const currentChain = SUPPORTED_CHAINS.find(c => c.id === chainId);

  return {
    chainId,
    isSupported,
    currentChain,
    chainName: currentChain?.name ?? 'Unknown Network',
  };
}
```

### Composant NetworkBadge

```typescript
// components/NetworkBadge.tsx
'use client';

import { useChainId, useSwitchChain } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const SUPPORTED_CHAINS = {
  [sepolia.id]: { name: 'Sepolia', color: 'bg-purple-500' },
  [hardhat.id]: { name: 'Localhost', color: 'bg-gray-500' },
};

export function NetworkBadge() {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const chainInfo = SUPPORTED_CHAINS[chainId];
  const isSupported = !!chainInfo;

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Wrong Network
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={() => switchChain({ chainId: sepolia.id })}
          disabled={isPending}
        >
          {isPending ? 'Switching...' : 'Switch to Sepolia'}
        </Button>
      </div>
    );
  }

  return (
    <Badge className={chainInfo.color}>
      {chainInfo.name}
    </Badge>
  );
}
```

### Composant NetworkGuard

```typescript
// components/NetworkGuard.tsx
'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSwitchChain } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface NetworkGuardProps {
  children: React.ReactNode;
}

export function NetworkGuard({ children }: NetworkGuardProps) {
  const { isSupported, chainName } = useNetworkStatus();
  const { switchChain, isPending } = useSwitchChain();

  if (!isSupported) {
    return (
      <div className="container mx-auto p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Wrong Network Detected</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">
              You are currently connected to <strong>{chainName}</strong>.
              This application requires <strong>Sepolia Testnet</strong> or <strong>Localhost</strong>.
            </p>
            <Button
              onClick={() => switchChain({ chainId: sepolia.id })}
              disabled={isPending}
            >
              {isPending ? 'Switching...' : 'Switch to Sepolia'}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
```

### Usage dans le layout

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          <Header />
          <NetworkGuard>
            {children}
          </NetworkGuard>
        </Providers>
      </body>
    </html>
  );
}
```

### Désactivation conditionnelle des actions

```typescript
// Exemple dans un bouton Mint
const { isSupported } = useNetworkStatus();

<Button
  onClick={handleMint}
  disabled={!isSupported || isPending}
>
  {!isSupported ? 'Switch Network First' : 'Mint Card'}
</Button>
```

---

## Interface utilisateur

### Badge réseau (header)

```
┌─────────────────────────────────────────────────────────┐
│  Logo     Nav      [Sepolia] 0x1234...abcd [Disconnect]│
└─────────────────────────────────────────────────────────┘

Ou si mauvais réseau:
┌─────────────────────────────────────────────────────────┐
│  Logo  Nav  [⚠️ Wrong Network] [Switch] 0x... [Disconnect]│
└─────────────────────────────────────────────────────────┘
```

### Alert pleine page (optionnel)

```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Wrong Network Detected                              │
│                                                          │
│  You are connected to Ethereum Mainnet.                 │
│  Please switch to Sepolia Testnet to use this app.      │
│                                                          │
│  [Switch to Sepolia]                                    │
└─────────────────────────────────────────────────────────┘
```

### Couleurs des badges

| Réseau | Couleur | Badge |
|--------|---------|-------|
| Sepolia | Violet | `bg-purple-500` |
| Localhost | Gris | `bg-gray-500` |
| Wrong | Rouge | `variant="destructive"` |

---

## Scénarios de test

| # | Scénario | Étapes | Résultat attendu |
|---|----------|--------|------------------|
| 1 | Réseau correct | 1. Connecter sur Sepolia | Badge "Sepolia" vert |
| 2 | Mauvais réseau | 1. Connecter sur Mainnet | Warning + bouton Switch |
| 3 | Switch réussi | 1. Être sur Mainnet 2. Cliquer "Switch to Sepolia" 3. Approuver | Badge devient "Sepolia" |
| 4 | Switch refusé | 1. Cliquer "Switch" 2. Refuser dans MetaMask | Warning persiste |
| 5 | Changement externe | 1. Être sur Sepolia 2. Changer manuellement dans MetaMask | UI se met à jour |
| 6 | Actions bloquées | 1. Être sur mauvais réseau 2. Essayer de mint | Bouton désactivé |

---

## Dépendances

### Dépendances fonctionnelles
- US-1.1 (Connexion Wallet) - doit être connecté pour détecter le réseau

### Bloque
- Toutes les interactions on-chain (mint, trade) dépendent du bon réseau

---

## Notes de développement

### Ajout d'un réseau personnalisé

Si le réseau n'est pas dans MetaMask (ex: Hardhat local), on peut demander son ajout :

```typescript
// MetaMask ajoutera le réseau automatiquement si non connu
switchChain({ chainId: hardhat.id });

// wagmi config doit inclure les infos du réseau
const hardhat = {
  id: 31337,
  name: 'Localhost',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
};
```

### Écoute des changements de réseau

wagmi gère automatiquement l'écoute des événements `chainChanged` de MetaMask. Les hooks se mettent à jour en temps réel.

---

## Définition of Done

- [ ] Hook `useNetworkStatus` implémenté
- [ ] Composant `NetworkBadge` dans le header
- [ ] Composant `NetworkGuard` pour bloquer les pages
- [ ] Boutons d'action désactivés sur mauvais réseau
- [ ] Tests manuels sur Sepolia et Localhost
- [ ] Tests manuels de switch de réseau
