/**
 * Configuration des smart contracts
 * ABI et adresses des contrats PokemonCards et TradeMarket
 */

// Adresses des contrats (à remplacer après déploiement)
export const pokemonCardsAddress = (process.env.NEXT_PUBLIC_POKEMON_CARDS_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

export const tradeMarketAddress = (process.env.NEXT_PUBLIC_TRADE_MARKET_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

/**
 * ABI du contrat PokemonCards
 * Fonctions nécessaires pour le mint et la lecture
 */
export const pokemonCardsAbi = [
  // Fonctions d'écriture
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'pokemonId', type: 'uint256' },
      { name: 'rarityTier', type: 'uint8' },
      { name: 'value', type: 'uint256' },
      { name: 'uri', type: 'string' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  // Fonctions de lecture
  {
    name: 'getOwnedCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenOfOwnerByIndex',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getCardMeta',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'createdAt', type: 'uint256' },
          { name: 'lastTransferAt', type: 'uint256' },
          { name: 'lockUntil', type: 'uint256' },
          { name: 'pokemonId', type: 'uint256' },
          { name: 'rarityTier', type: 'uint8' },
          { name: 'value', type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'getPreviousOwners',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address[]' }],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'isLocked',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'getLockUntil',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'exists',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'ownerOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'isPokemonMinted',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'pokemonId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  // Events
  {
    name: 'CardMinted',
    type: 'event',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'pokemonId', type: 'uint256', indexed: false },
      { name: 'rarityTier', type: 'uint8', indexed: false },
    ],
  },
  {
    name: 'CardLocked',
    type: 'event',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'until', type: 'uint256', indexed: false },
    ],
  },
] as const;

/**
 * Constantes du contrat PokemonCards
 */
export const MAX_CARDS_PER_WALLET = 4;
export const LOCK_DURATION = 10 * 60; // 10 minutes en secondes
export const MAX_POKEMON_ID = 151;
export const MIN_POKEMON_ID = 1;
