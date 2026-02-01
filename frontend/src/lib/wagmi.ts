import { createConfig, http, fallback } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Configuration avec plusieurs endpoints RPC en fallback
// Si un endpoint échoue, le suivant sera utilisé automatiquement
export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected({ target: 'metaMask' }),
  ],
  transports: {
    [sepolia.id]: fallback([
      http(process.env.NEXT_PUBLIC_RPC_URL, {
        batch: true, // Active le batching des requêtes
        timeout: 30_000, // 30 secondes de timeout
      }),
      http('https://rpc.sepolia.org', {
        batch: true,
        timeout: 30_000,
      }),
      http('https://ethereum-sepolia-rpc.publicnode.com', {
        batch: true,
        timeout: 30_000,
      }),
      http('https://rpc2.sepolia.org', {
        batch: true,
        timeout: 30_000,
      }),
    ]),
  },
  // Optimisation pour réduire les requêtes
  pollingInterval: 4_000, // Réduit la fréquence de polling à 4 secondes
});
