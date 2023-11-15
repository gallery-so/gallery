import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { SignInBottomSheet } from '~/components/Login/SignInBottomSheet';
import { SafeAreaViewWithPadding, useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { OrderedListItem, Typography } from '~/components/Typography';
import { LoginStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';

import { Button } from '../../components/Button';
import { LandingLogo } from './LandingLogo';
import { QRCodeIcon } from './QRCodeIcon';

export function LandingScreen() {
  const { bottom } = useSafeAreaPadding();
  const navigation = useNavigation<LoginStackNavigatorProp>();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // [app-store-build] disable onboarding video
    // AsyncStorage.getItem(SEEN_ONBOARDING_VIDEO_STORAGE_KEY).then((value) => {
    //   if (value !== 'true') {
    //     navigation.navigate('OnboardingVideo');
    //   }
    // });
  }, [navigation]);

  const initialSnapPoints = useMemo(() => ['CONTENT_HEIGHT'], []);
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(initialSnapPoints);

  const qrCodeSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const handleQrCodePress = useCallback(() => {
    qrCodeSheetRef.current?.present();
  }, []);

  const handleBottomSheetQRCodePress = useCallback(() => {
    setError('');

    qrCodeSheetRef.current?.dismiss();

    navigation.navigate('QRCode', {
      onError: (message) => {
        setError(message);
      },
    });
  }, [navigation]);

  const toggleOption = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  return (
    <SafeAreaViewWithPadding className="flex h-full flex-col justify-end bg-white dark:bg-black-900">
      <GalleryBottomSheetModal
        ref={qrCodeSheetRef}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
      >
        <View
          onLayout={handleContentLayout}
          style={{ paddingBottom: bottom }}
          className="px-8 flex flex-col space-y-8"
        >
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            If you’re signed in on Gallery elsewhere, you can sign in instantly via QR code.
          </Typography>

          <View className="flex flex-col space-y-2">
            <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }}>Scan QR Code</Typography>

            <View className="flex flex-col">
              <OrderedListItem
                number={1}
                className="text-sm leading-loose"
                font={{ family: 'ABCDiatype', weight: 'Regular' }}
              >
                Open gallery.so/settings on a different device.
              </OrderedListItem>
              <OrderedListItem
                number={2}
                className="text-sm leading-loose"
                font={{ family: 'ABCDiatype', weight: 'Regular' }}
              >
                Click "QR Code for Login"
              </OrderedListItem>
              <OrderedListItem
                number={3}
                className="text-sm leading-loose"
                font={{ family: 'ABCDiatype', weight: 'Regular' }}
              >
                Scan the QR Code.
              </OrderedListItem>
            </View>
          </View>

          <Button
            eventElementId="Scan QR Code Button"
            eventName="Scan QR Code Button Clicked"
            eventContext={contexts.Authentication}
            onPress={handleBottomSheetQRCodePress}
            icon={<QRCodeIcon />}
            text="SCAN QR CODE"
          />
        </View>
      </GalleryBottomSheetModal>

      <View className="flex flex-grow flex-col items-center space-y-12 justify-between">
        <View className="pt-32">
          <LandingLogo />
        </View>

        <View className="flex flex-col space-y-4 w-8/12">
          <View className="w-[160px] space-y-2 self-center pb-6">
            <Button
              onPress={toggleOption}
              text="Sign In"
              eventElementId="Secondary Login Options Ellipses"
              eventName="Display Secondary Login Options"
              eventContext={contexts.Authentication}
            />

            <SignInBottomSheet ref={bottomSheetRef} onQrCodePress={handleQrCodePress} />
          </View>
          {error && (
            <Typography
              className="text-sm text-error text-center"
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
            >
              {error}
            </Typography>
          )}
        </View>
      </View>
    </SafeAreaViewWithPadding>
  );
}
