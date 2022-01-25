import mixpanel from 'mixpanel-browser';
import { isWeb3Error } from 'types/Error';

if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN && process.env.NEXT_PUBLIC_ANALYTICS_API_URL) {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
    api_host: process.env.NEXT_PUBLIC_ANALYTICS_API_URL,
  });
}

type EventProps = Record<string, unknown>;

const mixpanelEnabled =
  process.env.NEXT_PUBLIC_MIXPANEL_TOKEN && process.env.NEXT_PUBLIC_ANALYTICS_API_URL;

type ConnectWalletOutcomeDetails = {
  success: boolean;
  error?: string;
};

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

  trackConnectWallet: (walletName: string, connectionMode: string) => {
    Mixpanel.track('Connect wallet', {
      wallet_provider: walletName,
      connection_mode: connectionMode,
    });
  },

  trackConnectWalletAttempt: (walletName: string, connectionMode: string) => {
    Mixpanel.track('Connect Wallet - Attempt', {
      wallet_provider: walletName,
      connection_mode: connectionMode,
    });
  },

  trackConnectWalletOutcome: (
    walletName: string,
    connectionMode: string,
    outcomeDetails: ConnectWalletOutcomeDetails
  ) => {
    Mixpanel.track(`Connect Wallet - ${outcomeDetails.success ? 'Success' : 'Error'}`, {
      wallet_provider: walletName,
      connection_mode: connectionMode,
      ...outcomeDetails,
    });
  },

  trackConnectWalletOutcomeSuccess: (walletName: string, connectionMode: string) => {
    Mixpanel.trackConnectWalletOutcome(walletName, connectionMode, {
      success: true,
    });
  },

  trackConnectWalletOutcomeError: (walletName: string, connectionMode: string, error: unknown) => {
    let errorMessage;
    if (isWeb3Error(error)) {
      errorMessage = `Web3 Error: ${error.customMessage}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = 'Unknown';
    }

    Mixpanel.trackConnectWalletOutcome(walletName, connectionMode, {
      success: false,
      error: errorMessage,
    });
  },
};

export default Mixpanel;
