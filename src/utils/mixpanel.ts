import mixpanel from 'mixpanel-browser';

if (process.env.REACT_APP_MIXPANEL_TOKEN && process.env.REACT_APP_ANALYTICS_API_URL) {
  mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN, {
    api_host: process.env.REACT_APP_ANALYTICS_API_URL,
  });
}

type EventProps = Record<string, unknown>;

const mixpanelEnabled = process.env.REACT_APP_MIXPANEL_TOKEN && process.env.REACT_APP_ANALYTICS_API_URL;

const Mixpanel = {
  track: (eventname: string, props: EventProps = {}) => {
    if (mixpanelEnabled) {
      mixpanel.track(eventname, props);
    }
  },

  trackConnectWallet: (walletName: string, connectionMode: string) => {
    Mixpanel.track('Connect wallet', {
      'Wallet Provider': walletName,
      'Connection Mode': connectionMode,
    });
  },
};

export default Mixpanel;
