import { useCallback } from 'react';
import { isWeb3Error } from 'types/Error';
import { useTrack } from './AnalyticsContext';

const useTrackAuthEvent = () => {
  const track = useTrack();

  return useCallback(
    (eventName: string, walletName: string, connectionMode: string, errorMessage?: string) => {
      track(eventName, {
        wallet_provider: walletName,
        connection_mode: connectionMode,
        ...(errorMessage && { error: errorMessage }),
      });
    },
    [track]
  );
};

const AUTH_MODE_SIGN_IN = 'Sign In';
const AUTH_MODE_ADD_WALLET = 'Add Wallet';

export const useTrackSigninAttempt = (walletName: string) => {
  const trackAuthEvent = useTrackAuthEvent();
  trackAuthEvent('Sign In - Attempt', walletName, AUTH_MODE_SIGN_IN);
};

export const useTrackSignInSuccess = (walletName: string) => {
  const trackAuthEvent = useTrackAuthEvent();
  trackAuthEvent('Sign In - Success', walletName, AUTH_MODE_SIGN_IN);
};

export const useTrackSignInError = (walletName: string, error: unknown) => {
  const trackAuthEvent = useTrackAuthEvent();
  trackAuthEvent('Sign In - Error', walletName, AUTH_MODE_SIGN_IN, getAuthErrorMessage(error));
};

export const useTrackAddWalletAttempt = (walletName: string) => {
  const trackAuthEvent = useTrackAuthEvent();
  trackAuthEvent('Add Wallet - Attempt', walletName, AUTH_MODE_ADD_WALLET);
};

export const useTrackAddWalletSuccess = (walletName: string) => {
  const trackAuthEvent = useTrackAuthEvent();
  trackAuthEvent('Add Wallet - Success', walletName, AUTH_MODE_ADD_WALLET);
};

export const useTrackAddWalletError = (walletName: string, error: unknown) => {
  const trackAuthEvent = useTrackAuthEvent();
  trackAuthEvent(
    'Add Wallet - Error',
    walletName,
    AUTH_MODE_ADD_WALLET,
    getAuthErrorMessage(error)
  );
};

function getAuthErrorMessage(error: unknown) {
  if (isWeb3Error(error)) {
    return `Web3 Error: ${error.customMessage}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown';
}
