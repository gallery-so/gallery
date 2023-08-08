import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { SafeAreaViewWithPadding, useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { LoginStackNavigatorProp } from '~/navigation/types';

import { Button } from '../../components/Button';
import { OrderedListItem, Typography } from '../../components/Typography';
import { EmailIcon } from './EmailIcon';
import { LandingLogo } from './LandingLogo';
import { QRCodeIcon } from './QRCodeIcon';

export function LandingScreen() {
  const { bottom } = useSafeAreaPadding();
  const navigation = useNavigation<LoginStackNavigatorProp>();

  const [error, setError] = useState('');
  const handleEmailPress = useCallback(() => {
    setError('');

    navigation.navigate('EnterEmail');
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

  return (
    <SafeAreaViewWithPadding className="flex h-full flex-col justify-end bg-white dark:bg-black-900">
      <GalleryBottomSheetModal
        ref={qrCodeSheetRef}
        snapPoints={animatedSnapPoints.value}
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
            onPress={handleBottomSheetQRCodePress}
            icon={<QRCodeIcon />}
            text="SCAN QR CODE"
          />
        </View>
      </GalleryBottomSheetModal>

      <View className="flex flex-grow flex-col justify-center items-center space-y-12">
        <LandingLogo />

        <View className="flex flex-col space-y-4 w-8/12">
          <Typography
            className="text-metal text-center text-sm"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            Select a sign in method
          </Typography>

          <Button
            eventElementId="QR Code Button"
            eventName="Sign In Selection"
            properties={{
              'Sign In Method': 'QR Code',
            }}
            onPress={handleQrCodePress}
            variant="primary"
            icon={<QRCodeIcon />}
            text="Scan QR Code"
            style={{ justifyContent: 'space-between' }}
          />

          <Button
            eventElementId="Email Button"
            eventName="Sign In Selection"
            variant="secondary"
            properties={{
              'Sign In Method': 'Email',
            }}
            onPress={handleEmailPress}
            icon={<EmailIcon />}
            text="Use verified email"
          />

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

      <View className="pb-5">
        <Typography
          className="text-metal text-center text-sm"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          New user? Please sign up on gallery.so first.
        </Typography>
      </View>
    </SafeAreaViewWithPadding>
  );
}
