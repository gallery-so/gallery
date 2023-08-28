import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import clsx from 'clsx';
import { ForwardedRef, forwardRef, useRef } from 'react';
import { View, ViewProps } from 'react-native';
import { ArbitrumIcon } from 'src/icons/ArbitrumIcon';
import { EthIcon } from 'src/icons/EthIcon';
import { OptimismIcon } from 'src/icons/OptimismIcon';
import { PolygonIcon } from 'src/icons/PolygonIcon';
import { ZoraIcon } from 'src/icons/ZoraIcon';

import { BottomSheetRow } from '../Feed/Posts/PostBottomSheet';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { Typography } from '../Typography';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

type Props = {
  onConnectWallet: () => void;
};

function WalletSelectorBottomSheet(
  { onConnectWallet }: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const { bottom } = useSafeAreaPadding();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  return (
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
    >
      <View
        onLayout={handleContentLayout}
        style={{ paddingBottom: bottom }}
        className="p-4 flex flex-col space-y-6"
      >
        <View className="flex flex-col space-y-4">
          <Typography
            className="text-lg text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            Network
          </Typography>
        </View>

        <View className="flex flex-col space-y-2">
          <BottomSheetRow
            icon={
              <View className="bg-white p-1 rounded-full">
                <EthIcon width={24} height={24} />
              </View>
            }
            fontWeight="Bold"
            text="Ethereum and L2s"
            onPress={onConnectWallet}
            rightIcon={<EvmStackedIcons />}
          />
        </View>
      </View>
    </GalleryBottomSheetModal>
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
    <View className={clsx('border-2 border-white rounded-full w-5 h-5', className)} style={style}>
      {children}
    </View>
  );
}
