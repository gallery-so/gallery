import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultWallets, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import merge from 'lodash.merge';
import { ReactNode } from 'react';
import { configureChains, createClient, defaultChains, WagmiConfig } from 'wagmi';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';

import colors from '~/components/core/colors';

// Unfortunately, RainbowKit has no way to customize font weight
// https://github.com/rainbow-me/rainbowkit/discussions/361

// And we can't separate the selected wallet button color from
// the "Get" button text color - they both lean on `accentColor`.

const myCustomTheme = merge(lightTheme(), {
  colors: {
    accentColor: colors.activeBlue,
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
    // modalBackground: '...',
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
  fonts: {
    body: 'ABC Diatype',
  },
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
  infuraProvider({ apiKey: '84842078b09946638c03157f83405213' }),
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

type Props = {
  children: ReactNode;
};

export default function EthereumProviders({ children }: Props) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={myCustomTheme}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
