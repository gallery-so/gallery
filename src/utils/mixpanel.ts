import mixpanel from 'mixpanel-browser';

if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN && process.env.NEXT_PUBLIC_ANALYTICS_API_URL) {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
    api_host: process.env.NEXT_PUBLIC_ANALYTICS_API_URL,
  });
}

type EventProps = Record<string, unknown>;

const mixpanelEnabled =
  process.env.NEXT_PUBLIC_MIXPANEL_TOKEN && process.env.NEXT_PUBLIC_ANALYTICS_API_URL;

const Mixpanel = {
  track: (eventname: string, props: EventProps = {}) => {
    if (mixpanelEnabled) {
      mixpanel.track(eventname, props);
    }
  },

  trackConnectWallet: (walletName: string, connectionMode: string) => {
    Mixpanel.track('Connect wallet', {
      wallet_provider: walletName,
      connection_mode: connectionMode,
    });
  },
};

export default Mixpanel;
