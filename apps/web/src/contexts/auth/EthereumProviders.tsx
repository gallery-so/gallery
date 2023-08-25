import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultWallets, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import merge from 'lodash.merge';
import { ReactNode } from 'react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { arbitrum, base, mainnet, optimism, zora } from 'wagmi/chains';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';

import colors from '~/shared/theme/colors';

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

const { chains, publicClient } = configureChains(
  [mainnet, optimism, arbitrum, zora, base],
  [
    // TODO: rotate creds
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY ?? '' }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Gallery',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? 'defaultId', // use defaultId because if projectId is undefined, it throws an error that breaks the build during the bundle-diff job
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

type Props = {
  children: ReactNode;
};

export default function EthereumProviders({ children }: Props) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} theme={myCustomTheme}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
