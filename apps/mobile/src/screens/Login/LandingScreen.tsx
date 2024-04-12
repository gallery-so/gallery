import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { SignInBottomSheet } from '~/components/Login/SignInBottomSheet';
import { SafeAreaViewWithPadding } from '~/components/SafeAreaViewWithPadding';
import { OrderedListItem, Typography } from '~/components/Typography';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { useManageWalletActions } from '~/contexts/ManageWalletContext';
import { LoginStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';

import { Button } from '../../components/Button';
import { SEEN_ONBOARDING_VIDEO_STORAGE_KEY } from '../Onboarding/OnboardingVideoScreen';
import { LandingLogo } from './LandingLogo';
import { QRCodeIcon } from './QRCodeIcon';

export function LandingScreen() {
  const navigation = useNavigation<LoginStackNavigatorProp>();

  const [error, setError] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(SEEN_ONBOARDING_VIDEO_STORAGE_KEY).then((value) => {
      if (value !== 'true') {
        navigation.navigate('OnboardingVideo');
      }
    });
  }, [navigation]);

  const qrCodeSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { showBottomSheetModal, hideBottomSheetModal } = useBottomSheetModalActions();
  const handleBottomSheetQRCodePress = useCallback(() => {
    setError('');

    hideBottomSheetModal();

    navigation.navigate('QRCode', {
      onError: (message) => {
        setError(message);
      },
    });
  }, [hideBottomSheetModal, navigation]);

  const handleQrCodePress = useCallback(() => {
    qrCodeSheetRef.current?.present();
    showBottomSheetModal({
      content: <QrCodeBottomSheet handleBottomSheetQRCodePress={handleBottomSheetQRCodePress} />,
    });
  }, [handleBottomSheetQRCodePress, showBottomSheetModal]);

  const { openManageWallet } = useManageWalletActions();
  const showSignInBottomSheet = useCallback(() => {
    showBottomSheetModal({
      content: (
        <SignInBottomSheet onQrCodePress={handleQrCodePress} openManageWallet={openManageWallet} />
      ),
    });
  }, [handleQrCodePress, openManageWallet, showBottomSheetModal]);

  return (
    <SafeAreaViewWithPadding className="flex h-full flex-col justify-end bg-white dark:bg-black-900">
      <View className="flex flex-grow flex-col items-center space-y-12 justify-between">
        <View className="pt-32">
          <LandingLogo />
        </View>

        <View className="flex flex-col space-y-4 w-8/12">
          <View className="w-[200px] space-y-2 self-center">
            <Button
              onPress={showSignInBottomSheet}
              variant="primary"
              text="get started"
              eventElementId="Get Started Button"
              eventName="Get Started Button Clicked"
              eventContext={contexts.Authentication}
            />
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

function QrCodeBottomSheet({
  handleBottomSheetQRCodePress,
}: {
  handleBottomSheetQRCodePress: () => void;
}) {
  return (
    <View className="flex flex-col space-y-8">
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
        headerElement={<QRCodeIcon />}
        text="SCAN QR CODE"
      />
    </View>
  );
}
