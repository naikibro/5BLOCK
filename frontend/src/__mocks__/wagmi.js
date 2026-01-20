// Mock for wagmi hooks
export const useAccount = jest.fn(() => ({
  address: undefined,
  isConnected: false,
  isConnecting: false,
  isDisconnected: true,
}));

export const useConnect = jest.fn(() => ({
  connect: jest.fn(),
  connectors: [],
  error: null,
  isLoading: false,
  isPending: false,
  pendingConnector: null,
}));

export const useDisconnect = jest.fn(() => ({
  disconnect: jest.fn(),
  isPending: false,
}));

export const useChainId = jest.fn(() => 11155111); // Sepolia by default

export const useSwitchChain = jest.fn(() => ({
  switchChain: jest.fn(),
  isPending: false,
  error: null,
}));

// Mock chains - also available from wagmi/chains
export const chains = {
  sepolia: {
    id: 11155111,
    name: 'Sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://rpc.sepolia.org'] },
    },
  },
  hardhat: {
    id: 31337,
    name: 'Localhost',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['http://127.0.0.1:8545'] },
    },
  },
};

export const sepolia = chains.sepolia;
export const hardhat = chains.hardhat;

// Export for easy reset in tests
export const __resetMocks = () => {
  useAccount.mockReturnValue({
    address: undefined,
    isConnected: false,
    isConnecting: false,
    isDisconnected: true,
  });
  
  useConnect.mockReturnValue({
    connect: jest.fn(),
    connectors: [],
    error: null,
    isLoading: false,
    isPending: false,
    pendingConnector: null,
  });
  
  useDisconnect.mockReturnValue({
    disconnect: jest.fn(),
    isPending: false,
  });
  
  useChainId.mockReturnValue(11155111);
  
  useSwitchChain.mockReturnValue({
    switchChain: jest.fn(),
    isPending: false,
    error: null,
  });
};
