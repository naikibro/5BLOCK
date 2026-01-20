/**
 * Composant pour sélectionner une carte Pokémon
 * Affiche une liste déroulante avec image, nom et valeur
 */

'use client';

import Image from 'next/image';
import type { OwnedCard } from '@/types/pokemon';

export interface CardSelectorProps {
  cards: OwnedCard[]; // Liste des cartes disponibles
  selectedId: bigint | null; // ID de la carte sélectionnée
  onSelect: (id: bigint | null) => void; // Callback de sélection
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Composant de sélection de carte
 * Affiche les cartes avec leurs métadonnées
 */
export function CardSelector({
  cards,
  selectedId,
  onSelect,
  disabled,
  placeholder = 'Select a card',
}: CardSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onSelect(value ? BigInt(value) : null);
  };

  return (
    <div className="w-full">
      <select
        value={selectedId?.toString() ?? ''}
        onChange={handleChange}
        disabled={disabled || cards.length === 0}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {cards.map((card) => {
          const name = card.metadata?.name ?? `Card #${card.tokenId}`;
          return (
            <option key={card.tokenId.toString()} value={card.tokenId.toString()}>
              {name} - Value: {card.value} (Token #{card.tokenId.toString()})
            </option>
          );
        })}
      </select>

      {/* Preview de la carte sélectionnée */}
      {selectedId !== null && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg">
          {cards
            .filter((card) => card.tokenId === selectedId)
            .map((card) => {
              const imageUrl = card.metadata?.image?.replace(
                'ipfs://',
                'https://gateway.pinata.cloud/ipfs/'
              );

              return (
                <div key={card.tokenId.toString()} className="flex items-center gap-4">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={card.metadata?.name ?? 'Card'}
                      width={80}
                      height={80}
                      className="object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium">{card.metadata?.name ?? 'Unknown'}</p>
                    <p className="text-sm text-gray-600">Value: {card.value}</p>
                    <p className="text-xs text-gray-500">Token ID: {card.tokenId.toString()}</p>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
