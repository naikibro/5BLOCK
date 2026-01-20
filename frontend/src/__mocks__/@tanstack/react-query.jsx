// Mock for @tanstack/react-query
import React from 'react';

export const useQueryClient = jest.fn(() => ({
  clear: jest.fn(),
  invalidateQueries: jest.fn(),
  removeQueries: jest.fn(),
}));

export const QueryClient = jest.fn(function() {
  this.clear = jest.fn();
  this.invalidateQueries = jest.fn();
  this.removeQueries = jest.fn();
});

export const QueryClientProvider = ({ children }) => {
  return React.createElement('div', { 'data-testid': 'query-provider' }, children);
};

export const useQuery = jest.fn(() => ({
  data: undefined,
  isLoading: false,
  error: null,
}));
