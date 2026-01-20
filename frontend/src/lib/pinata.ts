/**
 * Service Pinata pour l'upload d'images et métadonnées sur IPFS
 * Les appels passent par les API routes Next.js pour cacher le JWT
 */

import { CardMetadata } from '@/types/pokemon';

/**
 * Pin une image Pokemon sur IPFS via Pinata
 * @param imageUrl - URL de l'image depuis PokeAPI
 * @param pokemonId - ID du Pokemon pour le nom du fichier
 * @returns CID IPFS de l'image
 * @throws Error si l'upload échoue
 */
export async function pinImageToIPFS(
  imageUrl: string,
  pokemonId: number
): Promise<string> {
  try {
    // Fetch l'image depuis PokeAPI
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image from ${imageUrl}`);
    }

    const imageBlob = await imageResponse.blob();

    // Créer FormData pour l'upload
    const formData = new FormData();
    formData.append('file', imageBlob, `pokemon-${pokemonId}.png`);
    formData.append(
      'pinataMetadata',
      JSON.stringify({
        name: `Pokemon #${pokemonId} Image`,
      })
    );

    // Upload via notre API route (cache le JWT)
    const response = await fetch('/api/pin/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to pin image to IPFS');
    }

    const data = await response.json();
    return data.IpfsHash;
  } catch (error) {
    console.error('Error pinning image to IPFS:', error);
    throw error instanceof Error ? error : new Error('Failed to pin image');
  }
}

/**
 * Pin des métadonnées JSON sur IPFS via Pinata
 * @param metadata - Métadonnées de la carte Pokemon
 * @returns CID IPFS des métadonnées
 * @throws Error si l'upload échoue
 */
export async function pinMetadataToIPFS(
  metadata: CardMetadata
): Promise<string> {
  try {
    // Upload via notre API route (cache le JWT)
    const response = await fetch('/api/pin/metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to pin metadata to IPFS');
    }

    const data = await response.json();
    return data.IpfsHash;
  } catch (error) {
    console.error('Error pinning metadata to IPFS:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to pin metadata');
  }
}
