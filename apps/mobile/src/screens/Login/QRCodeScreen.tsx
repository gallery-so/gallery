import { useNavigation } from '@react-navigation/native';
import { BarCodeScannedCallback, BarCodeScanner, PermissionStatus } from 'expo-barcode-scanner';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconContainer } from '../../components/IconContainer';
import { Typography } from '../../components/Typography';
import { BackIcon } from '../../icons/BackIcon';

export function QRCodeScreen() {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation();

  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>(
    PermissionStatus.UNDETERMINED
  );

  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();

      setPermissionStatus(status);
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = useCallback<BarCodeScannedCallback>(({ type, data }) => {
    setScanned(true);

    // TODO: Do something w/ data
    console.log(type, data);
  }, []);

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
          style={{ top }}
          className="px-6 py-2"
          icon={<BackIcon />}
          onPress={navigation.goBack}
        />

        <View className="flex h-1/3 flex-col space-y-4 rounded-lg bg-white py-4 px-6">
          <Typography className="text-base" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            If you’re signed in on Gallery elsewhere, you can sign in instantly via QR code.
          </Typography>

          <View className="flex flex-col">
            <Typography className="text-lg" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              Scan QR Code
            </Typography>

            <View className="flex flex-col">
              <Typography
                className="text-base leading-loose"
                font={{ family: 'ABCDiatype', weight: 'Regular' }}
              >
                1. Open gallery.so/settings on a different device.
              </Typography>
              <Typography
                className="text-base leading-loose"
                font={{ family: 'ABCDiatype', weight: 'Regular' }}
              >
                2. Click “QR Code for Login”.
              </Typography>
              <Typography
                className="text-base leading-loose"
                font={{ family: 'ABCDiatype', weight: 'Regular' }}
              >
                3. Scan the QR Code.
              </Typography>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
