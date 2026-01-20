/**
 * API Route: Pin Metadata JSON to IPFS via Pinata
 * POST /api/pin/metadata
 * 
 * Body: JSON metadata object
 * Response: { IpfsHash: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateServerEnv } from '@/lib/env';

const PINATA_API = 'https://api.pinata.cloud';

export async function POST(request: NextRequest) {
  try {
    // Valider et récupérer les variables d'environnement
    const env = validateServerEnv();

    // Récupérer les métadonnées JSON
    const metadata = await request.json();

    // Préparer le body pour Pinata
    const body = {
      pinataContent: metadata,
      pinataMetadata: {
        name: metadata.name || 'Pokemon Card Metadata',
      },
    };

    // Appeler Pinata avec le JWT côté serveur
    const response = await fetch(`${PINATA_API}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Pinata error:', error);
      return NextResponse.json(
        { error: 'Failed to pin JSON to IPFS' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/pin/metadata:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
