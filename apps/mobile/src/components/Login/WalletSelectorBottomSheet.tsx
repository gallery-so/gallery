import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { useWalletConnectModal, WalletConnectModal } from '@walletconnect/modal-react-native';
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

const SNAP_POINTS = ['CONTENT_HEIGHT'];

const projectId = '93ea9c14da3ab92ac4b72d97c124b96c';

const providerMetadata = {
  name: 'Gallery',
  description: 'Gallery Mobile App',
  url: 'https://gallery.so',
  icons: [
    'https://f4shnljo4g7olt4wifnpdfz6752po37hr3waoaxakgpxqw64jojq.arweave.net/LyR2rS7hvuXPlkFa8Zc-_3T3b-eO7AcC4FGfeFvcS5M',
  ],
  redirect: {
    native: 'applinks:gallery.so/',
    universal: 'https://gallery.so',
  },
};

type Props = {
  title?: string;
  isSignedIn: boolean;
  onDismiss: () => void;
};

function WalletSelectorBottomSheet(
  { isSignedIn, onDismiss, title = 'Network' }: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const { bottom } = useSafeAreaPadding();

  const { open, isConnected, provider } = useWalletConnectModal();
  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const handleConnectWallet = useCallback(async () => {
    if (isConnected) {
      return provider?.disconnect();
    }
    open();
  }, [isConnected, open, provider]);

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
          <View className="flex flex-col space-y-4">
            {isSignedIn ? (
              <Typography
                className="text-lg text-black-900 dark:text-offWhite text-center"
                font={{ family: 'ABCDiatype', weight: 'Bold' }}
              >
                Please sign the message in your wallet
              </Typography>
            ) : (
              <Typography
                className="text-lg text-black-900 dark:text-offWhite"
                font={{ family: 'ABCDiatype', weight: 'Bold' }}
              >
                {title}
              </Typography>
            )}
          </View>

          <View className="flex flex-col space-y-2">
            {isSignedIn ? (
              <View
                className="items-center"
                style={{
                  paddingBottom: bottom,
                }}
              >
                <SpinnerIcon spin />
              </View>
            ) : (
              <BottomSheetRow
                icon={
                  <View className="bg-white p-1 rounded-full">
                    <EthIcon width={24} height={24} />
                  </View>
                }
                fontWeight="Bold"
                text="Ethereum and L2s"
                onPress={handleConnectWallet}
                rightIcon={<EvmStackedIcons />}
                eventContext={contexts.Authentication}
              />
            )}
          </View>
        </View>
      </GalleryBottomSheetModal>
      <WalletConnectModal projectId={projectId} providerMetadata={providerMetadata} />
    </>
  );
}

const ForwardedWalletSelectorBottomSheet = forwardRef(WalletSelectorBottomSheet);

export { ForwardedWalletSelectorBottomSheet as WalletSelectorBottomSheet };

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
