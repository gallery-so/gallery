import { fireEvent, render, screen } from '@testing-library/react';
import WalletButton from 'components/WalletSelector/WalletButton';
import { injected } from 'connectors/index';

const activate = jest.fn();
const setToPendingState = jest.fn();

test('WalletButton attempts to connect on click', () => {
  // Mock Metamask installed (metamask injects a global API at window.ethereum)
  global.ethereum = {};

  render(
    <WalletButton
      walletName="metamask"
      isPending={false}
      connector={injected}
      activate={activate}
      setToPendingState={setToPendingState}
    ></WalletButton>
  );

  fireEvent.click(screen.getByTestId('wallet-button'));
  expect(setToPendingState).toHaveBeenCalledTimes(1);
  expect(activate).toHaveBeenCalledTimes(1);
});

test('WalletButton for Metamask option prompts Metamask install if Metamask is not installed', () => {
  global.ethereum = undefined;
  render(
    <WalletButton
      walletName="metamask"
      isPending={false}
      connector={injected}
      activate={activate}
      setToPendingState={setToPendingState}
    ></WalletButton>
  );

  expect(screen.getByTestId('wallet-button')).toHaveTextContent(
    'Install Metamask'
  );
});
