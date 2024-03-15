import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import clsx from 'clsx';
import { ForwardedRef, forwardRef, useCallback, useRef } from 'react';
import { View, ViewProps } from 'react-native';
import { CoinbaseWalletIcon } from 'src/icons/CoinbaseWalletIcon';
import { MetamaskIcon } from 'src/icons/MetamaskIcon';
import { RainbowIcon } from 'src/icons/RainbowIcon';
import { SpinnerIcon } from 'src/icons/SpinnerIcon';
import { WalletConnectIcon } from 'src/icons/WalletConnectIcon';

import { contexts } from '~/shared/analytics/constants';

import { BottomSheetRow } from '../BottomSheetRow';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { Typography } from '../Typography';
import { useCoinbaseWallet } from './WalletProvider/CoinbaseWallet/useCoinbaseWallet';
import { useWalletConnect } from './WalletProvider/WalletConnect/useWallectConnect';
import { WalletConnectProvider } from './WalletProvider/WalletConnect/WalletConnectProvider';

const SNAP_POINTS = [300, 'CONTENT_HEIGHT'];

type Props = {
  title?: string;
  onDismiss: () => void;
  onSignedIn: (address: string, nonce: string, signature: string, userExist: boolean) => void;
  isSigningIn: boolean;
  setIsSigningIn: (isSigningIn: boolean) => void;
};

type WalletSupport = 'WalletConnect' | 'CoinbaseWallet';

function WalletSelectorBottomSheet(
  { onDismiss, title = 'Network', onSignedIn, isSigningIn, setIsSigningIn }: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const { bottom } = useSafeAreaPadding();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const handleOnSignedIn = useCallback(
    (address: string, nonce: string, signature: string, userExist: boolean) => {
      onSignedIn(address, nonce, signature, userExist);
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
      <GalleryBottomSheetModal
        ref={(value) => {
          bottomSheetRef.current = value;
          if (typeof ref === 'function') {
            ref(value);
          } else if (ref) {
            ref.current = value;
          }
        }}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        onDismiss={onDismiss}
      >
        <View
          onLayout={handleContentLayout}
          style={{ paddingBottom: bottom }}
          className="p-4 flex flex-col space-y-6"
        >
          {isSigningIn ? (
            <SignedInWalletMessage />
          ) : (
            <WalletOptions title={title} onSelect={handleSelectWallet} />
          )}
        </View>
      </GalleryBottomSheetModal>
      <WalletConnectProvider />
    </>
  );
}

const ForwardedWalletSelectorBottomSheet = forwardRef(WalletSelectorBottomSheet);

export { ForwardedWalletSelectorBottomSheet as WalletSelectorBottomSheet };

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
