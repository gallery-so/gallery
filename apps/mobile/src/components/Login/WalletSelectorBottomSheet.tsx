import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import clsx from 'clsx';
import { ForwardedRef, forwardRef, useCallback, useRef } from 'react';
import { View, ViewProps } from 'react-native';
import { ArbitrumIcon } from 'src/icons/ArbitrumIcon';
import { EthIcon } from 'src/icons/EthIcon';
import { OptimismIcon } from 'src/icons/OptimismIcon';
import { PolygonIcon } from 'src/icons/PolygonIcon';
import { SpinnerIcon } from 'src/icons/SpinnerIcon';
import { ZoraIcon } from 'src/icons/ZoraIcon';

import { contexts } from '~/shared/analytics/constants';

import { BottomSheetRow } from '../BottomSheetRow';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { Typography } from '../Typography';
import { useWalletConnect } from './WalletProvider/WalletConnect/useWallectConnect';
import { WalletConnectProvider } from './WalletProvider/WalletConnect/WalletConnectProvider';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

type Props = {
  title?: string;
  onDismiss: () => void;
  onSignedIn: (address: string, nonce: string, signature: string, userExist: boolean) => void;
  isSigningIn: boolean;
  setIsSigningIn: (isSigningIn: boolean) => void;
};

type WalletSupport = 'WalletConnect';

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
  const handleSelectWallet = useCallback(() => {
    open();
  }, [open]);

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
        'border-2 border-white dark:border-black-800 rounded-full w-5 h-5',
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
          icon={
            <View className="bg-white p-1 rounded-full">
              <EthIcon width={24} height={24} />
            </View>
          }
          fontWeight="Bold"
          text="Ethereum and L2s"
          onPress={() => onSelect('WalletConnect')}
          rightIcon={<EvmStackedIcons />}
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

function EvmStackedIcons() {
  return (
    <View className="flex-row">
      <IconWrapper>
        <ArbitrumIcon />
      </IconWrapper>
      <IconWrapper className="-ml-2">
        <OptimismIcon />
      </IconWrapper>
      <IconWrapper className="-ml-2">
        <ZoraIcon />
      </IconWrapper>
      <IconWrapper className="-ml-2">
        <PolygonIcon width={24} height={24} />
      </IconWrapper>
    </View>
  );
}
