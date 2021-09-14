import mixpanel from 'mixpanel-browser';

if (process.env.REACT_APP_MIXPANEL_TOKEN) {
  mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN);
}

type EventProps = Record<string, unknown>;

const mixpanelEnabled = process.env.NODE_ENV === 'production';

const Mixpanel = {
  track: (eventname: string, props: EventProps = {}) => {
    if (mixpanelEnabled) {
      mixpanel.track(eventname, props);
    }
  },

  trackConnectWallet: (walletName: string) => {
    Mixpanel.track('Connect wallet', {
      'Wallet Provider': walletName,
    });
  },
};

export default Mixpanel;
