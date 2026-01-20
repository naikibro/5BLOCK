/**
 * Tests pour PokemonCard
 */

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PokemonCard } from '../PokemonCard';
import { Pokemon } from '@/types/pokemon';
import { ReactNode } from 'react';

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({ address: undefined, isConnected: false })),
  useReadContract: jest.fn(() => ({ data: 0n, isLoading: false })),
  useWriteContract: jest.fn(() => ({ 
    writeContractAsync: jest.fn(),
    data: undefined,
    reset: jest.fn(),
  })),
  useWaitForTransactionReceipt: jest.fn(() => ({ isSuccess: false })),
  useChainId: jest.fn(() => 31337),
}));

// Mock useNetworkStatus
jest.mock('../../hooks/useNetworkStatus', () => ({
  useNetworkStatus: jest.fn(() => ({ isSupported: true })),
}));

// Mock usePokemonMinted
jest.mock('../../hooks/usePokemonMinted', () => ({
  usePokemonMinted: jest.fn(() => ({ isMinted: false, isLoading: false })),
}));

// Wrapper avec QueryClient
function Wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const mockPokemon: Pokemon = {
  id: 25,
  name: 'pikachu',
  displayName: 'Pikachu',
  types: ['electric'],
  stats: {
    hp: 35,
    attack: 55,
    defense: 40,
    specialAttack: 50,
    specialDefense: 50,
    speed: 90,
  },
  image: 'https://example.com/pikachu.png',
  sprite: 'https://example.com/pikachu-sprite.png',
  height: 4,
  weight: 60,
  baseExperience: 112,
  value: 130,
  rarityTier: 1,
  rarityName: 'COMMON',
};

describe('PokemonCard', () => {
  it('devrait afficher le nom du Pokémon', () => {
    render(
      <Wrapper>
        <PokemonCard pokemon={mockPokemon} />
      </Wrapper>
    );
    expect(screen.getByText('Pikachu')).toBeDefined();
  });

  it('devrait afficher l\'ID du Pokémon', () => {
    render(
      <Wrapper>
        <PokemonCard pokemon={mockPokemon} />
      </Wrapper>
    );
    expect(screen.getByText('#25')).toBeDefined();
  });

  it('devrait afficher les types du Pokémon', () => {
    render(
      <Wrapper>
        <PokemonCard pokemon={mockPokemon} />
      </Wrapper>
    );
    expect(screen.getByText('electric')).toBeDefined();
  });

  it('devrait afficher les stats (HP, ATK, DEF)', () => {
    render(
      <Wrapper>
        <PokemonCard pokemon={mockPokemon} />
      </Wrapper>
    );
    expect(screen.getByText('HP')).toBeDefined();
    expect(screen.getByText('35')).toBeDefined();
    expect(screen.getByText('ATK')).toBeDefined();
    expect(screen.getByText('55')).toBeDefined();
    expect(screen.getByText('DEF')).toBeDefined();
    expect(screen.getByText('40')).toBeDefined();
  });

  it('devrait afficher la valeur calculée', () => {
    render(
      <Wrapper>
        <PokemonCard pokemon={mockPokemon} />
      </Wrapper>
    );
    expect(screen.getByText('Value')).toBeDefined();
    expect(screen.getByText('130')).toBeDefined();
  });

  it('devrait afficher un bouton (MintButton)', () => {
    render(
      <Wrapper>
        <PokemonCard pokemon={mockPokemon} />
      </Wrapper>
    );
    
    // Le MintButton doit être présent (le texte peut varier selon l'état)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('devrait afficher plusieurs types si le Pokémon en a plusieurs', () => {
    const multiTypePokemon: Pokemon = {
      ...mockPokemon,
      types: ['grass', 'poison'],
    };
    
    render(
      <Wrapper>
        <PokemonCard pokemon={multiTypePokemon} />
      </Wrapper>
    );
    expect(screen.getByText('grass')).toBeDefined();
    expect(screen.getByText('poison')).toBeDefined();
  });

  it('devrait afficher le RarityBadge', () => {
    render(
      <Wrapper>
        <PokemonCard pokemon={mockPokemon} />
      </Wrapper>
    );
    expect(screen.getByText('Common')).toBeDefined();
  });
});
