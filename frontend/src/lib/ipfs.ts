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
 */
export async function fetchIPFSMetadata(tokenURI: string): Promise<CardMetadata> {
  // Convertir ipfs:// en CID
  const cid = tokenURI.replace('ipfs://', '');

  // Essayer chaque gateway
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const response = await fetch(`${gateway}${cid}`, {
        signal: AbortSignal.timeout(10000), // 10s timeout
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      // Gateway failed, try next
      continue;
    }
  }

  throw new Error(`Failed to fetch metadata from IPFS: ${cid}`);
}
