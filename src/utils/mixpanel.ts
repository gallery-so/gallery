import mixpanel from 'mixpanel-browser';
import { isWeb3Error } from 'types/Error';

if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN && process.env.NEXT_PUBLIC_ANALYTICS_API_URL) {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
    api_host: process.env.NEXT_PUBLIC_ANALYTICS_API_URL,
  });
}

const mixpanelEnabled =
  process.env.NEXT_PUBLIC_MIXPANEL_TOKEN && process.env.NEXT_PUBLIC_ANALYTICS_API_URL;

// CONSTS
const AUTH_MODE_SIGN_IN = 'Sign In';
const AUTH_MODE_ADD_WALLET = 'Add Wallet';

// Types
type EventProps = Record<string, unknown>;

function getAuthErrorMessage(error: unknown) {
  if (isWeb3Error(error)) {
    return `Web3 Error: ${error.customMessage}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown';
}

const Mixpanel = {
  track: (eventname: string, props: EventProps = {}) => {
    if (mixpanelEnabled) {
      // mixpanel errors shouldn't disrupt app
      try {
        mixpanel.track(eventname, props);
      } catch (error: unknown) {
        console.error(error);
      }
    }
  },

  trackAuthEvent: (
    eventName: string,
    walletName: string,
    connectionMode: string,
    errorMessage?: string
  ) => {
    Mixpanel.track(eventName, {
      wallet_provider: walletName,
      connection_mode: connectionMode,
      ...(errorMessage && { error: errorMessage }),
    });
  },

  trackSignInAttempt: (walletName: string) => {
    Mixpanel.trackAuthEvent('Sign In - Attempt', walletName, AUTH_MODE_SIGN_IN);
  },

  trackSignInSuccess: (walletName: string) => {
    Mixpanel.trackAuthEvent('Sign In - Success', walletName, AUTH_MODE_SIGN_IN);
  },

  trackSignInError: (walletName: string, error: unknown) => {
    Mixpanel.trackAuthEvent(
      'Sign In - Error',
      walletName,
      AUTH_MODE_SIGN_IN,
      getAuthErrorMessage(error)
    );
  },

  trackAddWalletAttempt: (walletName: string) => {
    Mixpanel.trackAuthEvent('Add Wallet - Attempt', walletName, AUTH_MODE_ADD_WALLET);
  },

  trackAddWalletSuccess: (walletName: string) => {
    Mixpanel.trackAuthEvent('Add Wallet - Success', walletName, AUTH_MODE_ADD_WALLET);
  },

  trackAddWalletError: (walletName: string, error: unknown) => {
    Mixpanel.trackAuthEvent(
      'Add Wallet - Error',
      walletName,
      AUTH_MODE_ADD_WALLET,
      getAuthErrorMessage(error)
    );
  },
};

export default Mixpanel;
