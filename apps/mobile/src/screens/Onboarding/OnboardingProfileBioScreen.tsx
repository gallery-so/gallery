import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { BackButton } from '~/components/BackButton';
import { Button } from '~/components/Button';
import { OnboardingProgressBar } from '~/components/Onboarding/OnboardingProgressBar';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { Typography } from '~/components/Typography';
import { useToastActions } from '~/contexts/ToastContext';
import { OnboardingProfileBioScreenQuery } from '~/generated/OnboardingProfileBioScreenQuery.graphql';
import { LoginStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import useUpdateUser, { BIO_MAX_CHAR_COUNT } from '~/shared/hooks/useUpdateUser';
import colors from '~/shared/theme/colors';

function InnerOnboardingProfileBioScreen() {
  const query = useLazyLoadQuery<OnboardingProfileBioScreenQuery>(
    graphql`
      query OnboardingProfileBioScreenQuery {
        viewer {
          ... on Viewer {
            user {
              __typename
              dbid
              username
              socialAccounts {
                farcaster {
                  bio
                }
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
  const { pushToast } = useToastActions();

  const farcasterBio = user?.socialAccounts?.farcaster?.bio;

  useEffect(() => {
    if (farcasterBio) {
      pushToast({
        message: "We've imported your bio from Farcaster. You can edit it or keep it as is.",
        position: 'top',
        // 50 is the height of the header, 20 is the padding
        offSet: 50 + 20,
      });
    }
  }, [farcasterBio, pushToast]);

  const navigation = useNavigation<LoginStackNavigatorProp>();
  const { colorScheme } = useColorScheme();

  const { bottom } = useSafeAreaInsets();

  const [bio, setBio] = useState(farcasterBio ?? '');

  const updateUser = useUpdateUser();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSelectProfilePicture = useCallback(() => {
    navigation.navigate('OnboardingNftSelector', {
      page: 'ProfilePicture',
      fullScreen: true,
    });
  }, [navigation]);

  const handleNext = useCallback(async () => {
    if (!user) return null;

    if (bio) {
      await updateUser(user.dbid, user.username ?? '', bio);
    }

    navigation.navigate('OnboardingRecommendedUsers');
  }, [bio, navigation, updateUser, user]);

  if (user?.__typename !== 'GalleryUser') {
    throw new Error(`Unable to fetch the logged in user`);
  }

  return (
    <View className="flex flex-col flex-grow space-y-8 px-4">
      <View>
        <View className="relative flex-row items-center justify-between pb-4">
          <BackButton onPress={handleBack} />

          <View
            className="absolute w-full flex flex-row justify-center items-center"
            pointerEvents="none"
          >
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              Add a bio
            </Typography>
          </View>

          <View />
        </View>
        <OnboardingProgressBar from={60} to={80} />
      </View>
      <View
        className="flex-1 items-center justify-center space-y-[40px] px-8"
        style={{
          marginBottom: bottom,
        }}
      >
        <View className="space-y-3">
          <ProfilePicture
            userRef={user}
            size="xxl"
            onPress={handleSelectProfilePicture}
            isEditable
          />
          <Typography
            className="text-2xl text-shadow text-center"
            font={{ family: 'GTAlpina', weight: 'Light' }}
          >
            {user.username}
          </Typography>
        </View>

        <TextInput
          style={{
            fontSize: 16,
            fontFamily: 'ABCDiatype',
            textAlign: 'left',
          }}
          className="dark:text-white text-center"
          placeholderTextColor={colors.metal}
          selectionColor={colorScheme === 'dark' ? colors.offWhite : colors.black['800']}
          textAlignVertical="center"
          placeholder="Add your bio..."
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
  );
}

export function OnboardingProfileBioScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ paddingTop: top }}
      className="flex flex-1 flex-col bg-white dark:bg-black-900"
    >
      <Suspense fallback={null}>
        <InnerOnboardingProfileBioScreen />
      </Suspense>
    </KeyboardAvoidingView>
  );
}
