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

export const useTrackCreateUserSuccess = (walletName = 'unknown') => {
  const trackAuthEvent = useTrackAuthEvent();

  return useCallback(() => {
    trackAuthEvent('Create user', walletName, AUTH_MODE_SIGN_IN);
  }, [trackAuthEvent, walletName]);
};

export const useTrackSignInAttempt = () => {
  const trackAuthEvent = useTrackAuthEvent();

  return useCallback(
    (walletName: string) => {
      trackAuthEvent('Sign In - Attempt', walletName, AUTH_MODE_SIGN_IN);
    },
    [trackAuthEvent]
  );
};

export const useTrackSignInSuccess = () => {
  const trackAuthEvent = useTrackAuthEvent();
  return useCallback(
    (walletName: string) => {
      trackAuthEvent('Sign In - Success', walletName, AUTH_MODE_SIGN_IN);
    },
    [trackAuthEvent]
  );
};

export const useTrackSignInError = () => {
  const trackAuthEvent = useTrackAuthEvent();
  return useCallback(
    (walletName: string, error: unknown) => {
      trackAuthEvent('Sign In - Error', walletName, AUTH_MODE_SIGN_IN, getAuthErrorMessage(error));
    },
    [trackAuthEvent]
  );
};

export const useTrackAddWalletAttempt = () => {
  const trackAuthEvent = useTrackAuthEvent();
  return useCallback(
    (walletName: string) => {
      trackAuthEvent('Add Wallet - Attempt', walletName, AUTH_MODE_ADD_WALLET);
    },
    [trackAuthEvent]
  );
};

export const useTrackAddWalletSuccess = () => {
  const trackAuthEvent = useTrackAuthEvent();
  return useCallback(
    (walletName: string) => {
      trackAuthEvent('Add Wallet - Success', walletName, AUTH_MODE_ADD_WALLET);
    },
    [trackAuthEvent]
  );
};

export const useTrackAddWalletError = () => {
  const trackAuthEvent = useTrackAuthEvent();
  return useCallback(
    (walletName: string, error: unknown) => {
      trackAuthEvent(
        'Add Wallet - Error',
        walletName,
        AUTH_MODE_ADD_WALLET,
        getAuthErrorMessage(error)
      );
    },
    [trackAuthEvent]
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

export function isEarlyAccessError(error: unknown) {
  return (
    error instanceof Error && error.message.toLowerCase().includes('required tokens not owned')
  );
}

export function isNotEarlyAccessError(errorMessage?: string) {
  return errorMessage?.toLowerCase().includes('required tokens not owned');
}
