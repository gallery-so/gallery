import { fireEvent, render, screen } from '@testing-library/react';
import WalletButton from 'components/WalletSelector/WalletButton';
import { injected,  } from 'connectors/index';

const activate = jest.fn();
const enableIsConnectingState = jest.fn();

test('WalletButton attempts to connect on click', () => {
  // Mock Metamask installed (metamask injects a global API at window.ethereum)
  global.ethereum = {}

  render(
    <WalletButton
      walletName="metamask"
      isConnecting={false}
      connector={injected}
      activate={activate}
      enableIsConnectingState={enableIsConnectingState}
    ></WalletButton>
  );

  fireEvent.click(screen.getByTestId('wallet-button'));
  expect(enableIsConnectingState).toHaveBeenCalledTimes(1);
  expect(activate).toHaveBeenCalledTimes(1);
});

test('WalletButton for Metamask option prompts Metamask install if Metamask is not installed', () => {
  global.ethereum = undefined;
  render(
    <WalletButton
      walletName="metamask"
      isConnecting={false}
      connector={injected}
      activate={activate}
      enableIsConnectingState={enableIsConnectingState}
    ></WalletButton>
  );

  expect(screen.getByTestId('wallet-button')).toHaveTextContent('Install Metamask');
});

