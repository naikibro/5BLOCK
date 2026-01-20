/**
 * API Route: Pin Image to IPFS via Pinata
 * POST /api/pin/image
 * 
 * Body: FormData with 'file' and 'pinataMetadata'
 * Response: { IpfsHash: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateServerEnv } from '@/lib/env';

const PINATA_API = 'https://api.pinata.cloud';

export async function POST(request: NextRequest) {
  try {
    // Valider et récupérer les variables d'environnement
    const env = validateServerEnv();

    // Récupérer le FormData de la requête
    const formData = await request.formData();

    // Appeler Pinata avec le JWT côté serveur
    const response = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.PINATA_JWT}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Pinata error:', error);
      return NextResponse.json(
        { error: 'Failed to pin file to IPFS' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/pin/image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
