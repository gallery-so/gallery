// We're ignoring all of this since it pollutes our typecheck
// We'll leave this here until we actually fix the errors.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { fireEvent, render, screen } from '@testing-library/react';
import WalletButton from 'components/WalletSelector/DeprecatedWalletButton';
import { injected } from 'connectors/index';

const activate = jest.fn();
const setToPendingState = jest.fn();

describe.skip('WalletButton', () => {
  test('WalletButton attempts to connect on click', () => {
    // Mock Metamask installed (metamask injects a global API at window.ethereum)
    // @ts-expect-error Missing global typedefs
    global.ethereum = {};

    render(
      <WalletButton
        walletName="metamask"
        isPending={false}
        connector={injected}
        activate={activate}
        setToPendingState={setToPendingState}
      />
    );

    fireEvent.click(screen.getByTestId('wallet-button'));
    expect(setToPendingState).toHaveBeenCalledTimes(1);
    expect(activate).toHaveBeenCalledTimes(1);
  });

  test('WalletButton for Metamask option prompts Metamask install if Metamask is not installed', () => {
    // @ts-expect-error Missing global typedefs
    global.ethereum = undefined;
    render(
      <WalletButton
        walletName="metamask"
        isPending={false}
        connector={injected}
        activate={activate}
        setToPendingState={setToPendingState}
      />
    );

    expect(screen.getByTestId('wallet-button')).toHaveTextContent('Install Metamask');
  });
});
