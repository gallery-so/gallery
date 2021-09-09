import { render, screen } from '@testing-library/react';
import {
  createHistory,
  createMemorySource,
  LocationProvider,
} from '@reach/router';
import AppProvider from 'contexts/AppProvider';
import Routes from './Routes';

function renderWithRouter(
  ui: React.ReactNode,
  { route = '/', history = createHistory(createMemorySource(route)) } = {},
) {
  return {
    ...render(<LocationProvider history={history}>{ui}</LocationProvider>),
    // Adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history,
  };
}

test('Does not render navbar on homepage', async () => {
  renderWithRouter(
    <AppProvider>
      <Routes />
    </AppProvider>,
    { route: '/' },
  );

  expect(screen.queryByTestId('navbar')).toBeNull();
});

test('Renders navbar on profile page', () => {
  renderWithRouter(
    <AppProvider>
      <Routes />
    </AppProvider>,
    { route: '/fabricsoftener' },
  );

  expect(screen.queryByTestId('navbar')).not.toBeNull();
});

// TDDO: test navbar appearance based on logged in / logged out view
