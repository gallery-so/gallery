import mixpanel, { track } from 'mixpanel-browser';

if (process.env.REACT_APP_MIXPANEL_TOKEN) {
  mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN);
}

type EventProps = {};

const mixpanelEnabled = process.env.NODE_ENV === 'production';

const Mixpanel = {
  track: (name: string, props: EventProps) => {
    if (mixpanelEnabled) {
      mixpanel.track(name, props);
    }
  },

  trackConnectWallet: (walletName: string) => {
    Mixpanel.track('Connect wallet', {
      'Wallet Provider': walletName,
    });
  },
};

export default Mixpanel;
