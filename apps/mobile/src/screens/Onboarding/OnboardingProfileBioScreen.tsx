import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { BackButton } from '~/components/BackButton';
import { Button } from '~/components/Button';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { Typography } from '~/components/Typography';
import { useManageWalletActions } from '~/contexts/ManageWalletContext';
import { OnboardingProfileBioScreenQuery } from '~/generated/OnboardingProfileBioScreenQuery.graphql';
import { LoginStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import useUpdateUser, { BIO_MAX_CHAR_COUNT } from '~/shared/hooks/useUpdateUser';
import colors from '~/shared/theme/colors';

import { navigateToNotificationUpsellOrHomeScreen } from '../Login/navigateToNotificationUpsellOrHomeScreen';

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
  const { openManageWallet } = useManageWalletActions();

  const track = useTrack();
  const navigation = useNavigation<LoginStackNavigatorProp>();
  const { colorScheme } = useColorScheme();

  const { top, bottom } = useSafeAreaInsets();

  const [bio, setBio] = useState('');

  const updateUser = useUpdateUser();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSelectProfilePicture = useCallback(() => {
    if (!user?.primaryWallet) {
      track('Profile Picture Pressed', {
        id: 'Onboarding Profile Picture Selected',
        name: 'Onboarding Profile Picture Selected',
        screen: 'OnboardingProfileBio',
      });

      openManageWallet({
        title: 'Connect your wallet to view your collection',
        onSuccess: () => {
          navigation.navigate('OnboardingNftSelector', {
            page: 'ProfilePicture',
            fullScreen: true,
          });
        },
      });

      return;
    }

    navigation.navigate('OnboardingNftSelector', {
      page: 'ProfilePicture',
      fullScreen: true,
    });
  }, [navigation, openManageWallet, track, user?.primaryWallet]);

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
              eventContext={contexts.Onboarding}
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
              eventContext={contexts.Onboarding}
              text="SKIP"
            />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
