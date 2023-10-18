import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { BarCodeScannedCallback, BarCodeScanner, PermissionStatus } from 'expo-barcode-scanner';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoginStackNavigatorParamList, LoginStackNavigatorProp } from '~/navigation/types';
import { navigateToNotificationUpsellOrHomeScreen } from '~/screens/Login/navigateToNotificationUpsellOrHomeScreen';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';

import { IconContainer } from '../../components/IconContainer';
import { useLogin } from '../../hooks/useLogin';
import { BackIcon } from '../../icons/BackIcon';

export function QRCodeScreen() {
  const { top } = useSafeAreaInsets();
  const route = useRoute<RouteProp<LoginStackNavigatorParamList, 'QRCode'>>();
  const navigation = useNavigation<LoginStackNavigatorProp>();

  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>(
    PermissionStatus.UNDETERMINED
  );

  const [scanned, setScanned] = useState(false);
  const track = useTrack();

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();

      setPermissionStatus(status);
    };

    getBarCodeScannerPermissions();
  }, []);

  const [login] = useLogin();

  const reportError = useReportError();
  const handleBarCodeScanned = useCallback<BarCodeScannedCallback>(
    async ({ data }) => {
      setScanned(true);

      track('Sign In Attempt', { 'Sign In Selection': 'QR code' });

      function handleLoginError(message: string) {
        reportError(`LoginError: ${message}`);

        route.params.onError(message);
      }

      const result = await login({
        oneTimeLoginToken: {
          token: data,
        },
      });

      if (result.kind === 'success') {
        track('Sign In Success', { 'Sign In Selection': 'QR code' });
        await navigateToNotificationUpsellOrHomeScreen(navigation);
      } else {
        setScanned(false);
        track('Sign In Failure', { 'Sign In Selection': 'QR code' });
        handleLoginError(result.message);
      }
    },
    [login, navigation, reportError, route.params, track]
  );

  return (
    <View className="relative flex h-full w-full flex-col">
      {permissionStatus === PermissionStatus.GRANTED ? (
        <BarCodeScanner
          className="h-full w-full"
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
      ) : (
        <View className="h-full w-full bg-black"></View>
      )}

      <View className="absolute inset-0 flex flex-col justify-between">
        <IconContainer
          eventElementId={null}
          eventName={null}
          eventContext={null}
          style={{ top }}
          className="px-6 py-2"
          icon={<BackIcon />}
          onPress={navigation.goBack}
        />
      </View>
    </View>
  );
}
