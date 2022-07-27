import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultWallets, RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { defaultChains, configureChains, createClient, WagmiConfig } from 'wagmi';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import merge from 'lodash.merge';

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
    //   modalBackground: '...',
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

const { chains, provider } = configureChains(defaultChains, [
  // TODO: move this to env and rotate creds
  infuraProvider({ infuraId: '84842078b09946638c03157f83405213' }),
  publicProvider(),
]);

const { connectors } = getDefaultWallets({
  appName: 'Gallery',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export const EtheremProviders: React.FC<{}> = ({ children }) => (
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider chains={chains} theme={myCustomTheme}>
      {children}
    </RainbowKitProvider>
  </WagmiConfig>
);
