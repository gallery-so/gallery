import clsx from 'clsx';
import { useCallback } from 'react';
import { View, ViewProps } from 'react-native';
import { SignerVariables } from 'shared/hooks/useAuthPayloadQuery';
import { CoinbaseWalletIcon } from 'src/icons/CoinbaseWalletIcon';
import { MetamaskIcon } from 'src/icons/MetamaskIcon';
import { RainbowIcon } from 'src/icons/RainbowIcon';
import { SpinnerIcon } from 'src/icons/SpinnerIcon';
import { WalletConnectIcon } from 'src/icons/WalletConnectIcon';

import { contexts } from '~/shared/analytics/constants';

import { BottomSheetRow } from '../BottomSheetRow';
import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { Typography } from '../Typography';
import { useCoinbaseWallet } from './AuthProvider/CoinbaseWallet/useCoinbaseWallet';
import { useWalletConnect } from './AuthProvider/WalletConnect/useWallectConnect';
import { WalletConnectProvider } from './AuthProvider/WalletConnect/WalletConnectProvider';

type Props = {
  title?: string;
  onDismiss: () => void;
  onSignedIn: (p: SignerVariables & { userExists: boolean }) => void;
  isSigningIn: boolean;
  setIsSigningIn: (isSigningIn: boolean) => void;
};

type WalletSupport = 'WalletConnect' | 'CoinbaseWallet';

export default function WalletSelectorBottomSheet({
  onDismiss,
  title = 'Network',
  onSignedIn,
  isSigningIn,
  setIsSigningIn,
}: Props) {
  const { bottom } = useSafeAreaPadding();

  const handleOnSignedIn: Props['onSignedIn'] = useCallback(
    (props) => {
      onSignedIn(props);
      onDismiss();
    },
    [onDismiss, onSignedIn]
  );
  const { open } = useWalletConnect({
    onIsSigningIn: setIsSigningIn,
    onSignedIn: handleOnSignedIn,
  });

  const { open: openCoinbaseWallet } = useCoinbaseWallet({
    onIsSigningIn: setIsSigningIn,
    onSignedIn: handleOnSignedIn,
  });

  const handleSelectWallet = useCallback(
    (wallet: WalletSupport) => {
      if (wallet === 'CoinbaseWallet') {
        openCoinbaseWallet();
        return;
      }

      open();
    },
    [open, openCoinbaseWallet]
  );

  return (
    <>
      <View style={{ paddingBottom: bottom }} className="flex flex-col space-y-6">
        {isSigningIn ? (
          <SignedInWalletMessage />
        ) : (
          <WalletOptions title={title} onSelect={handleSelectWallet} />
        )}
      </View>
      <WalletConnectProvider />
    </>
  );
}

function IconWrapper({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: ViewProps['style'];
  className?: string;
}) {
  return (
    <View
      className={clsx(
        'bg-white items-center justify-center border-2 border-white dark:border-black-800 rounded-full w-6 h-6',
        className
      )}
      style={style}
    >
      {children}
    </View>
  );
}

type WalletOptionsProps = {
  title?: string;
  onSelect: (wallet: WalletSupport) => void;
};
function WalletOptions({ onSelect, title }: WalletOptionsProps) {
  return (
    <View className="flex flex-col space-y-4">
      <Typography
        className="text-lg text-black-900 dark:text-offWhite"
        font={{ family: 'ABCDiatype', weight: 'Bold' }}
      >
        {title || 'Select wallet'}
      </Typography>

      <View className="flex flex-col space-y-2">
        <BottomSheetRow
          icon={<WalletStackedIcons />}
          fontWeight="Bold"
          text="MetaMask or Rainbow"
          onPress={() => onSelect('WalletConnect')}
          eventContext={contexts.Authentication}
        />
        <BottomSheetRow
          icon={<CoinbaseWalletIcon />}
          fontWeight="Bold"
          text="Coinbase Wallet"
          onPress={() => onSelect('CoinbaseWallet')}
          eventContext={contexts.Authentication}
        />
        <BottomSheetRow
          icon={<WalletConnectIcon />}
          fontWeight="Bold"
          text="Other (via WalletConnect)"
          onPress={() => onSelect('WalletConnect')}
          eventContext={contexts.Authentication}
        />
      </View>
    </View>
  );
}

function SignedInWalletMessage() {
  const { bottom } = useSafeAreaPadding();

  return (
    <>
      <View>
        <Typography
          className="text-lg text-black-900 dark:text-offWhite text-center"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          Please sign the message in your wallet
        </Typography>
      </View>
      <View className="flex flex-col space-y-2">
        <View
          className="items-center"
          style={{
            paddingBottom: bottom,
          }}
        >
          <SpinnerIcon spin />
        </View>
      </View>
    </>
  );
}

function WalletStackedIcons() {
  return (
    <View className="flex-row">
      <IconWrapper>
        <MetamaskIcon />
      </IconWrapper>
      <IconWrapper className="-ml-2">
        <RainbowIcon />
      </IconWrapper>
    </View>
  );
}
