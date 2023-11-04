global.console = {
  ...console,
  // uncomment to ignore a specific log level
  warn: jest.fn(),
};

jest.mock('~/env/runtime', () => ({
  env: {
    GRAPHQL_API_URL: 'https://api.example.com/graphql',
  },
}));
