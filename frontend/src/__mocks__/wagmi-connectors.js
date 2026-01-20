// Mock for wagmi/connectors
export const injected = jest.fn((config) => ({
  type: 'injected',
  name: 'MetaMask',
  ...config,
}));
