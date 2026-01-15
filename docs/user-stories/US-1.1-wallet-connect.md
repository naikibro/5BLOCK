# US-1.1: Connexion Wallet

> **Epic:** Gestion du Wallet
> **Priorité:** Must Have
> **Complexité:** Faible

---

## Description

**En tant qu'** utilisateur,
**Je veux** connecter mon wallet MetaMask à la DApp,
**Afin de** pouvoir interagir avec mes cartes et le marketplace.

---

## Contexte & Justification

La connexion wallet est le point d'entrée obligatoire de toute DApp Web3. Sans wallet connecté, l'utilisateur ne peut pas :
- Signer des transactions (mint, trade)
- Prouver son identité on-chain
- Voir ses cartes (ownership)

MetaMask est le wallet le plus répandu (>30M utilisateurs) et offre une API standardisée (EIP-1193).

---

## Critères d'acceptation

| ID | Critère | Vérifié |
|----|---------|---------|
| AC-1.1.1 | Un bouton "Connect Wallet" est visible sur la page d'accueil quand non connecté | [ ] |
| AC-1.1.2 | Au clic sur le bouton, MetaMask s'ouvre et demande l'autorisation de connexion | [ ] |
| AC-1.1.3 | Après connexion réussie, l'adresse du wallet est affichée en format tronqué (`0x1234...abcd`) | [ ] |
| AC-1.1.4 | L'état de connexion persiste lors de la navigation entre les pages de l'application | [ ] |
| AC-1.1.5 | Si MetaMask n'est pas installé, un message d'erreur clair guide l'utilisateur vers l'installation | [ ] |
| AC-1.1.6 | Le bouton affiche un état de chargement pendant la tentative de connexion | [ ] |
| AC-1.1.7 | Si l'utilisateur refuse la connexion dans MetaMask, un message d'erreur approprié s'affiche | [ ] |

---

## Règles métier

1. **Unicité de session** : Un seul wallet peut être connecté à la fois
2. **Persistence** : La connexion doit survivre au rechargement de page (si MetaMask le permet)
3. **Changement de compte** : Si l'utilisateur change de compte dans MetaMask, l'UI doit se mettre à jour automatiquement

---

## Spécifications techniques

### Stack utilisée
- **wagmi v2** : React hooks pour Ethereum
- **viem** : Client Ethereum TypeScript
- **MetaMask** : Wallet browser extension

### Hooks wagmi

```typescript
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

// État du compte
const { address, isConnected, isConnecting, isDisconnected } = useAccount();

// Actions de connexion
const { connect, connectors, isPending, error } = useConnect();

// Action de déconnexion
const { disconnect } = useDisconnect();
```

### Composant WalletConnect

```typescript
// components/WalletConnect.tsx
'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Button } from '@/components/ui/button';

export function WalletConnect() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Format address: 0x1234...abcd
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <span className="font-mono text-sm">{formatAddress(address)}</span>
        <Button variant="outline" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => connect({ connector: injected({ target: 'metaMask' }) })}
      disabled={isConnecting}
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
```

### Configuration wagmi

```typescript
// lib/wagmi.ts
import { createConfig, http } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [sepolia, hardhat],
  connectors: [
    injected({ target: 'metaMask' }),
  ],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_QUICKNODE_URL),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
});
```

### Provider setup

```typescript
// app/providers.tsx
'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### Gestion des erreurs

```typescript
// Types d'erreurs possibles
type ConnectionError =
  | 'MetaMaskNotInstalled'    // Extension non détectée
  | 'UserRejected'           // Utilisateur a refusé
  | 'AlreadyProcessing'      // Demande déjà en cours
  | 'Unknown';               // Autre erreur

// Messages utilisateur
const errorMessages: Record<ConnectionError, string> = {
  MetaMaskNotInstalled: 'MetaMask is not installed. Please install it to continue.',
  UserRejected: 'Connection request was rejected. Please try again.',
  AlreadyProcessing: 'A connection request is already pending in MetaMask.',
  Unknown: 'An error occurred while connecting. Please try again.',
};
```

### Détection MetaMask

```typescript
// Vérifier si MetaMask est installé
const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && window.ethereum?.isMetaMask;
};

// Lien d'installation
const METAMASK_INSTALL_URL = 'https://metamask.io/download/';
```

---

## Interface utilisateur

### États du bouton

| État | Apparence | Action |
|------|-----------|--------|
| Non connecté | "Connect Wallet" (primary) | Ouvre MetaMask |
| Connexion en cours | "Connecting..." (disabled, spinner) | - |
| Connecté | Adresse + "Disconnect" (outline) | Déconnecte |
| Erreur | Message d'erreur en rouge | Retry possible |

### Wireframe

```
┌─────────────────────────────────────────────────────────┐
│  Header                                                  │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Logo          Nav Links        [Connect Wallet]   ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘

État connecté:
┌─────────────────────────────────────────────────────────┐
│  Header                                                  │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Logo     Nav Links    0x1234...abcd [Disconnect]  ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘

MetaMask non installé:
┌─────────────────────────────────────────────────────────┐
│  ⚠️ MetaMask is not installed.                          │
│  [Install MetaMask] ← link to metamask.io              │
└─────────────────────────────────────────────────────────┘
```

---

## Scénarios de test

### Test manuel

| # | Scénario | Étapes | Résultat attendu |
|---|----------|--------|------------------|
| 1 | Connexion réussie | 1. Cliquer "Connect Wallet" 2. Approuver dans MetaMask | Adresse affichée |
| 2 | Connexion refusée | 1. Cliquer "Connect Wallet" 2. Refuser dans MetaMask | Message d'erreur |
| 3 | MetaMask absent | 1. Désactiver MetaMask 2. Cliquer "Connect Wallet" | Lien installation |
| 4 | Persistence | 1. Se connecter 2. Recharger la page | Reste connecté |
| 5 | Changement compte | 1. Connecté 2. Changer compte dans MetaMask | Nouvelle adresse affichée |

### Test automatisé (optionnel)

```typescript
// __tests__/WalletConnect.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { WalletConnect } from '@/components/WalletConnect';

describe('WalletConnect', () => {
  it('should show connect button when disconnected', () => {
    render(<WalletConnect />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('should show address when connected', () => {
    // Mock useAccount to return connected state
    render(<WalletConnect />);
    expect(screen.getByText(/0x.*\.\.\..*/)).toBeInTheDocument();
  });
});
```

---

## Dépendances

### Dépendances techniques
- `wagmi` >= 2.5.0
- `viem` >= 2.7.0
- `@tanstack/react-query` >= 5.0.0

### Dépendances fonctionnelles
- Aucune (c'est la première fonctionnalité)

### Bloque
- Toutes les autres User Stories (mint, trade, inventory) nécessitent un wallet connecté

---

## Notes de développement

### Points d'attention
1. **SSR** : wagmi hooks utilisent `window`, donc composant doit être client-side (`'use client'`)
2. **Hydration** : Utiliser `mounted` state pour éviter les erreurs d'hydratation
3. **Multi-wallet** : Pour MVP, on ne supporte que MetaMask

### Anti-pattern à éviter
```typescript
// ❌ Ne pas faire : accès direct à window.ethereum
if (window.ethereum) {
  await window.ethereum.request({ method: 'eth_requestAccounts' });
}

// ✅ Faire : utiliser wagmi hooks
const { connect } = useConnect();
connect({ connector: injected() });
```

---

## Définition of Done

- [ ] Composant `WalletConnect` implémenté
- [ ] Configuration wagmi complète
- [ ] Provider intégré dans le layout
- [ ] Gestion des erreurs avec messages user-friendly
- [ ] Tests manuels passés
- [ ] Code review passée
- [ ] Documenté dans ce fichier
