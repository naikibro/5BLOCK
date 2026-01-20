/**
 * Service IPFS pour récupérer les métadonnées NFT
 * Utilise plusieurs gateways avec fallback
 */

import { CardMetadata } from '@/types/pokemon';

const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
];

/**
 * Récupère les métadonnées d'un NFT depuis IPFS
 * Essaye plusieurs gateways en cas d'échec
 * @param tokenURI - URI IPFS du token (format: ipfs://...)
 * @param timeoutMs - Timeout par gateway en millisecondes (défaut: 30s)
 */
export async function fetchIPFSMetadata(
  tokenURI: string, 
  timeoutMs: number = 30000
): Promise<CardMetadata> {
  // Convertir ipfs:// en CID
  const cid = tokenURI.replace('ipfs://', '');

  const errors: string[] = [];

  // Essayer chaque gateway
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const response = await fetch(`${gateway}${cid}`, {
        signal: AbortSignal.timeout(timeoutMs),
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      errors.push(`${gateway}: ${response.status} ${response.statusText}`);
    } catch (error) {
      errors.push(`${gateway}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Gateway failed, try next
      continue;
    }
  }

  const errorMessage = `Failed to fetch metadata from all IPFS gateways for CID: ${cid}\nErrors: ${errors.join(', ')}`;
  throw new Error(errorMessage);
}
