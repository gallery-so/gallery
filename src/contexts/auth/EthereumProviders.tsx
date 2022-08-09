import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultWallets,
  RainbowKitProvider,
  lightTheme,
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import { defaultChains, configureChains, createClient, WagmiConfig } from 'wagmi';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import merge from 'lodash.merge';
import { SafeConnector } from '@gnosis.pm/safe-apps-wagmi';

// console.log('current theme values:', lightTheme());

// Unfortunately, RainbowKit has no way to customize font weight
// https://github.com/rainbow-me/rainbowkit/discussions/361

// And we can't separate the selected wallet button color from
// the "Get" button text color - they both lean on `accentColor`.

// TODO: figure out if we need to customize any other options

const myCustomTheme = merge(lightTheme(), {
  colors: {
    //   accentColor: '...',
    //   accentColorForeground: '...',
    //   actionButtonBorder: '...',
    //   actionButtonBorderMobile: '...',
    actionButtonSecondaryBackground: 'transparent',
    //   closeButton: '...',
    closeButtonBackground: 'transparent',
    //   connectButtonBackground: '...',
    //   connectButtonBackgroundError: '...',
    //   connectButtonInnerBackground: '...',
    //   connectButtonText: '...',
    //   connectButtonTextError: '...',
    //   connectionIndicator: '...',
    //   error: '...',
    //   generalBorder: '...',
    //   generalBorderDim: '...',
    //   menuItemBackground: '...',
    modalBackdrop: 'transparent',
    // TODO: comment this out, just temporarily translucent to see behind it
    modalBackground: 'rgba(255, 255, 255, 0.8)',
    modalBorder: '#000',
    //   modalText: '...',
    //   modalTextDim: '...',
    //   modalTextSecondary: '...',
    //   profileAction: '...',
    //   profileActionHover: '...',
    //   profileForeground: '...',
    //   selectedOptionBorder: '...',
    //   standby: '...',
  },
  // fonts: {
  //   body: '...',
  // },
  radii: {
    actionButton: '0',
    connectButton: '0',
    menuButton: '0',
    modal: '0',
    modalMobile: '0',
  },
  shadows: {
    connectButton: 'none',
    dialog: 'none',
    profileDetailsAction: 'none',
    selectedOption: 'none',
    selectedWallet: 'none',
    walletLogo: 'none',
  },
});

const { chains, provider, webSocketProvider } = configureChains(defaultChains, [
  // TODO: move this to env and rotate creds
  infuraProvider({ apiKey: '84842078b09946638c03157f83405213' }),
  publicProvider(),
]);

const { wallets } = getDefaultWallets({
  appName: 'Gallery',
  chains,
});

wallets.push({
  groupName: 'Advanced',
  wallets: [
    {
      id: 'gnosisSafe',
      name: 'Gnosis Safe',
      iconUrl: '/icons/gnosis_safe.svg',
      iconBackground: '#fff',
      createConnector: () => ({ connector: new SafeConnector({ chains }) }),
    },
  ],
});

const connectors = connectorsForWallets(wallets);

const wagmiClient = createClient({
  autoConnect: false,
  connectors,
  provider,
  webSocketProvider,
});

export const EtheremProviders: React.FC<{}> = ({ children }) => (
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider chains={chains} theme={myCustomTheme}>
      {children}
    </RainbowKitProvider>
  </WagmiConfig>
);
