import { useNavigation } from '@react-navigation/native';
import { useWalletConnectModal } from '@walletconnect/modal-react-native';
import { ethers } from 'ethers';
import { useColorScheme } from 'nativewind';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { BackButton } from '~/components/BackButton';
import { Button } from '~/components/Button';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { WalletSelectorBottomSheet } from '~/components/Login/WalletSelectorBottomSheet';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { Typography } from '~/components/Typography';
import { OnboardingProfileBioScreenQuery } from '~/generated/OnboardingProfileBioScreenQuery.graphql';
import { LoginStackNavigatorProp } from '~/navigation/types';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import useAddWallet from '~/shared/hooks/useAddWallet';
import useCreateNonce from '~/shared/hooks/useCreateNonce';
import useUpdateUser, { BIO_MAX_CHAR_COUNT } from '~/shared/hooks/useUpdateUser';
import colors from '~/shared/theme/colors';

import { navigateToNotificationUpsellOrHomeScreen } from '../Login/navigateToNotificationUpsellOrHomeScreen';
import useSyncTokens from '../NftSelectorScreen/useSyncTokens';

export function OnboardingProfileBioScreen() {
  const query = useLazyLoadQuery<OnboardingProfileBioScreenQuery>(
    graphql`
      query OnboardingProfileBioScreenQuery {
        viewer {
          ... on Viewer {
            user {
              __typename
              dbid
              username
              primaryWallet {
                __typename
              }
              ...ProfilePictureFragment
            }
          }
        }
      }
    `,
    {}
  );

  const user = query?.viewer?.user;
  const { address, isConnected, provider } = useWalletConnectModal();
  const createNonce = useCreateNonce();
  const { isSyncing, syncTokens } = useSyncTokens();

  const track = useTrack();
  const navigation = useNavigation<LoginStackNavigatorProp>();
  const { colorScheme } = useColorScheme();

  const { top, bottom } = useSafeAreaInsets();

  const [bio, setBio] = useState('');

  const updateUser = useUpdateUser();
  const addWallet = useAddWallet();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const bottomSheet = useRef<GalleryBottomSheetModalType | null>(null);
  const handleSelectProfilePicture = useCallback(() => {
    if (!user?.primaryWallet) {
      bottomSheet.current?.present();
      return;
    }

    track('Profile Picture Pressed', {
      id: 'Onboarding Profile Picture Selected',
      name: 'Onboarding Profile Picture Selected',
      screen: 'OnboardingProfileBio',
    });

    navigation.navigate('OnboardingNftSelector', {
      page: 'ProfilePicture',
    });
  }, [navigation, track, user?.primaryWallet]);

  const handleNext = useCallback(async () => {
    if (!user) return null;

    if (bio) {
      await updateUser(user.dbid, user.username ?? '', bio);
    }

    await navigateToNotificationUpsellOrHomeScreen(navigation, true);
  }, [bio, navigation, updateUser, user]);

  if (user?.__typename !== 'GalleryUser') {
    throw new Error(`Unable to fetch the logged in user`);
  }
  const web3Provider = useMemo(
    () => (provider ? new ethers.providers.Web3Provider(provider) : undefined),
    [provider]
  );
  const [isSigningIn, setIsSigningIn] = useState(false);
  const handleDismiss = useCallback(() => {
    provider?.disconnect();
    setIsSigningIn(false);
  }, [provider]);

  const handleSignMessage = useCallback(async () => {
    if (!web3Provider || !address) {
      return;
    }

    const signer = web3Provider.getSigner();
    const { nonce } = await createNonce(address, 'Ethereum');

    try {
      setIsSigningIn(true);
      const signature = await signer.signMessage(nonce);

      const { signatureValid } = await addWallet({
        authMechanism: {
          eoa: {
            signature,
            nonce,
            chainPubKey: {
              pubKey: address,
              chain: 'Ethereum',
            },
          },
        },
        chainAddress: {
          address,
          chain: 'Ethereum',
        },
      });

      if (!signatureValid) {
        throw new Error('Signature is not valid');
      }

      if (!isSyncing) {
        syncTokens('Ethereum');
      }

      bottomSheet.current?.dismiss();

      navigation.navigate('OnboardingNftSelector', {
        page: 'ProfilePicture',
      });
    } catch (error) {
      provider?.disconnect();
    } finally {
      setIsSigningIn(false);
    }
  }, [address, addWallet, createNonce, isSyncing, navigation, provider, syncTokens, web3Provider]);

  useEffect(() => {
    if (isConnected) {
      handleSignMessage();
    } else {
      setIsSigningIn(false);
    }
  }, [isConnected, handleSignMessage]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ paddingTop: top }}
      className="flex flex-1 flex-col bg-white dark:bg-black-900"
    >
      <View className="flex flex-col flex-grow space-y-8 px-4">
        <View className="relative flex-row items-center justify-between ">
          <BackButton onPress={handleBack} />

          <View
            className="absolute w-full flex flex-row justify-center items-center"
            pointerEvents="none"
          >
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              Set up your profile
            </Typography>
          </View>

          <View />
        </View>

        <View
          className="flex-1 items-center justify-center space-y-12 px-8"
          style={{
            marginBottom: bottom,
          }}
        >
          <View>
            <ProfilePicture
              userRef={user}
              size="xxl"
              onPress={handleSelectProfilePicture}
              isEditable
            />
          </View>

          <TextInput
            style={{
              fontSize: 24,
              fontFamily: 'GTAlpinaStandardLight',
            }}
            className="dark:text-white text-center"
            placeholderTextColor={colors.metal}
            selectionColor={colorScheme === 'dark' ? colors.offWhite : colors.black['800']}
            textAlignVertical="center"
            placeholder="tell us about yourself..."
            value={bio}
            onChange={(e) => setBio(e.nativeEvent.text)}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
          />

          {bio.length > BIO_MAX_CHAR_COUNT && (
            <Typography
              className="text-sm text-red"
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
            >
              {`Bio must be less than ${BIO_MAX_CHAR_COUNT} characters`}
            </Typography>
          )}

          {bio.length > 0 ? (
            <Button
              onPress={handleNext}
              className="w-full"
              eventElementId="Next button on onboarding bio screen"
              eventName="Next button on onboarding bio screen"
              disabled={bio.length > BIO_MAX_CHAR_COUNT}
              variant={bio.length > BIO_MAX_CHAR_COUNT ? 'disabled' : 'primary'}
              text="NEXT"
            />
          ) : (
            <Button
              onPress={handleNext}
              variant="secondary"
              className="w-full"
              eventElementId="Skip onboarding bio & profile picture"
              eventName="Skip onboarding bio & profile picture"
              text="SKIP"
            />
          )}
        </View>
      </View>

      <WalletSelectorBottomSheet
        title="Connect your wallet to view your collection"
        ref={bottomSheet}
        isSignedIn={isSigningIn}
        onDismiss={handleDismiss}
      />
    </KeyboardAvoidingView>
  );
}
