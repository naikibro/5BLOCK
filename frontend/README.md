# 5BLOCK Frontend

Frontend Next.js 14 pour l'application DApp de trading de cartes Pokemon.

## Installation

```bash
# Installer les dépendances
pnpm install
```

## Configuration

Copier `.env.example` vers `.env.local` et configurer les variables d'environnement :

```env
NEXT_PUBLIC_QUICKNODE_URL=your_quicknode_endpoint
```

## Développement

```bash
# Démarrer le serveur de développement
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Tests

```bash
# Lancer les tests
pnpm test

# Lancer les tests en mode watch
pnpm test:watch
```

## Build

```bash
# Créer un build de production
pnpm build

# Démarrer le serveur de production
pnpm start
```

## Structure

```
frontend/
├── src/
│   ├── app/              # Pages Next.js App Router
│   ├── components/       # Composants React réutilisables
│   ├── lib/              # Utilitaires et configurations
│   └── types/            # Types TypeScript
├── public/               # Fichiers statiques
└── package.json
```

## Technologies

- **Next.js 14** : Framework React avec App Router
- **wagmi v2** : Hooks React pour Ethereum
- **viem** : Client Ethereum TypeScript
- **@tanstack/react-query** : Gestion d'état et cache
- **TypeScript** : Typage statique
- **Tailwind CSS** : Styles utilitaires
