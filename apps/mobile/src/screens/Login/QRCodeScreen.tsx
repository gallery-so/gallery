import MaskedView from '@react-native-masked-view/masked-view';
import { BarCodeScannedCallback, BarCodeScanner, PermissionStatus } from 'expo-barcode-scanner';
import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Typography } from '../../components/Typography';

export function QRCodeScreen() {
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
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  }, []);

  return (
    <View className="relative flex h-full w-full flex-col">
      {permissionStatus === PermissionStatus.GRANTED ? (
        <BarCodeScanner
          className="h-full w-full"
          barCodeTypes={['qr']}
          onBarCodeScanned={handleBarCodeScanned}
        />
      ) : (
        <View className="h-full w-full bg-black"></View>
      )}

      <View className="absolute inset-0 flex flex-col justify-end">
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
