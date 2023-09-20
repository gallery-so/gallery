import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Button } from '~/components/Button';
import { CheckInWalletSelectionFragment$key } from '~/generated/CheckInWalletSelectionFragment.graphql';
import colors from '~/shared/theme/colors';

import { BackButton } from '../BackButton';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Typography } from '../Typography';

type Props = {
  setConfirmedWalletAddress: (walletAddress: string) => void;
  userRef: CheckInWalletSelectionFragment$key;
};

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function CheckInWalletSelection({ setConfirmedWalletAddress, userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment CheckInWalletSelectionFragment on GalleryUser {
        __typename
        wallets {
          chain
          chainAddress {
            address
          }
        }
      }
    `,
    userRef
  );

  const [selectedAddress, setSelectedAddress] = useState('');

  const handleConfirmPress = useCallback(() => {
    setConfirmedWalletAddress(selectedAddress);
  }, [selectedAddress, setConfirmedWalletAddress]);

  const [showCustomAddressInput, setShowCustomAddressInput] = useState(false);
  const toggleShowCustomAddressInput = useCallback(() => {
    setShowCustomAddressInput((prev) => !prev);
  }, []);

  const ethereumWallets = useMemo(() => {
    return user.wallets?.filter((wallet) => wallet?.chain === 'Ethereum');
  }, [user.wallets]);

  const handleClearSelectedWallet = useCallback(() => {
    setSelectedAddress('');
  }, []);

  const [customAddress, setCustomAddress] = useState('');
  const handleCustomAddressChange = useCallback((text: string) => {
    setCustomAddress(text);
  }, []);

  const isCustomAddressValid = useMemo(() => {
    return customAddress && /^0x/.test(customAddress);
  }, [customAddress]);

  const { colorScheme } = useColorScheme();

  // WALLET CONFIRMATION
  if (selectedAddress) {
    return (
      <>
        <View className="flex flex-row space-x-2 mb-4 items-center">
          <BackButton onPress={handleClearSelectedWallet} size="sm" />
          <Typography className="text-lg" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            Confirm Wallet
          </Typography>
        </View>
        <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          Please confirm that your wallet address is correct. Note that there is only one entry per
          user permitted for this allowlist.
        </Typography>
        <Typography
          className="text-sm text-center my-6"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          {selectedAddress}
        </Typography>
        <Button
          onPress={handleConfirmPress}
          text="Confirm"
          eventElementId="Marfa Check In: Wallet Confirm Button"
          eventName="Pressed Marfa Check In: Wallet Confirm Button"
        />
      </>
    );
  }

  // CUSTOM ADDRESS INPUT
  if (showCustomAddressInput) {
    return (
      <>
        <View className="flex flex-row space-x-2 mb-4 items-center">
          <BackButton onPress={toggleShowCustomAddressInput} size="sm" />
          <Typography className="text-lg" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            Other wallet
          </Typography>
        </View>
        <Typography className="text-sm mb-4" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          Type or paste in your Ethereum wallet address below
        </Typography>
        <View className="bg-faint dark:text-white dark:bg-black-700 dark:color-white p-4 mb-4">
          <BottomSheetTextInput
            value={customAddress}
            onChangeText={handleCustomAddressChange}
            placeholderTextColor={colors.metal}
            autoFocus
            autoCapitalize="none"
            autoComplete="off"
            textAlignVertical="center"
            placeholder="0x0000...0000"
            keyboardAppearance={colorScheme}
            style={{ color: colorScheme === 'dark' ? colors.white : colors.black['800'] }}
          />
        </View>
        <Button
          onPress={() => setSelectedAddress(customAddress)}
          text="Next"
          disabled={!isCustomAddressValid}
          eventElementId="Marfa Check In: Wallet Custom Address Next Button"
          eventName="Pressed Marfa Check In: Wallet Custom Address Next Button"
        />
      </>
    );
  }

  // DEFAULT WALLET SELECTOR
  return (
    <>
      <Typography className="text-lg" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
        Select a wallet to enter the draw
      </Typography>
      <Typography className="text-sm mb-4" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
        Select your Ethereum wallet to enter the draw for an exclusive allowlist spot in the Gallery
        x Prohibition drop with Jimena Buena Vida!
      </Typography>
      <ScrollView className="mb-20">
        {ethereumWallets?.map(
          (wallet) =>
            wallet?.chainAddress?.address && (
              <View key={wallet.chainAddress.address}>
                <GalleryTouchableOpacity
                  onPress={() => setSelectedAddress(wallet?.chainAddress?.address ?? '')}
                  className="mb-2 bg-offWhite dark:bg-black-700 p-3"
                  eventElementId="Marfa Check In: Wallet Selection Wallet Button"
                  eventName="Pressed Marfa Check In: Wallet Selection Wallet Button"
                >
                  <Typography
                    className="dark:text-white text-sm"
                    font={{ family: 'ABCDiatype', weight: 'Bold' }}
                  >
                    {truncateAddress(wallet.chainAddress.address)}
                  </Typography>
                </GalleryTouchableOpacity>
              </View>
            )
        )}
        <GalleryTouchableOpacity
          onPress={toggleShowCustomAddressInput}
          className="mb-2 bg-offWhite dark:bg-black-700 p-3"
          eventElementId="Marfa Check In: Wallet Selection Custom Wallet Button"
          eventName="Pressed Marfa Check In: Wallet Selection Custom Wallet Button"
        >
          <Typography
            className="dark:text-white text-sm"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            Other
          </Typography>
        </GalleryTouchableOpacity>
      </ScrollView>
    </>
  );
}
