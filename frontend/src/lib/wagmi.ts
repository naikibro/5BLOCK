import { createConfig, http } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [sepolia, hardhat],
  connectors: [
    injected({ target: 'metaMask' }),
  ],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_QUICKNODE_URL),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
});
