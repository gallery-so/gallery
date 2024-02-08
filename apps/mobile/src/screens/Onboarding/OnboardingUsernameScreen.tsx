import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { BackButton } from '~/components/BackButton';
import { Button } from '~/components/Button';
import { OnboardingProgressBar } from '~/components/Onboarding/OnboardingProgressBar';
import { Typography } from '~/components/Typography';
import { useSyncTokensActions } from '~/contexts/SyncTokensContext';
// import useUpdateEmail from '~/shared/hooks/useUpdateEmail';
// import { useToastActions } from '~/contexts/ToastContext';
import { OnboardingUsernameScreenQuery } from '~/generated/OnboardingUsernameScreenQuery.graphql';
import { LoginStackNavigatorParamList, LoginStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import useCreateUser from '~/shared/hooks/useCreateUser';
import useDebounce from '~/shared/hooks/useDebounce';
import useUpdateUser from '~/shared/hooks/useUpdateUser';
import { useIsUsernameAvailableFetcher } from '~/shared/hooks/useUserInfoFormIsUsernameAvailableQuery';
import colors from '~/shared/theme/colors';
import {
  alphanumericUnderscores,
  maxLength,
  minLength,
  noConsecutivePeriodsOrUnderscores,
  required,
  validate,
} from '~/shared/utils/validators';

export function OnboardingUsernameScreen() {
  const query = useLazyLoadQuery<OnboardingUsernameScreenQuery>(
    graphql`
      query OnboardingUsernameScreenQuery {
        viewer {
          ... on Viewer {
            user {
              __typename
              dbid
              username
              bio
            }
          }
        }
      }
    `,
    {}
  );

  const user = query?.viewer?.user;

  const navigation = useNavigation<LoginStackNavigatorProp>();

  const { colorScheme } = useColorScheme();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const isUsernameAvailableFetcher = useIsUsernameAvailableFetcher();
  const reportError = useReportError();
  const { isSyncing, syncTokens } = useSyncTokensActions();
  // const { pushToast } = useToastActions();

  const route = useRoute<RouteProp<LoginStackNavigatorParamList, 'OnboardingUsername'>>();
  // const email = route.params.email;

  const [username, setUsername] = useState(user?.username ?? '');
  const [bio] = useState('');

  // This cannot be derived from a "null" `usernameError`
  // since the value starts off as empty when the form is empty
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const debouncedUsername = useDebounce(username, 500);

  const authMechanism = route.params.authMechanism;

  const { top, bottom } = useSafeAreaInsets();

  // const updateEmail = useUpdateEmail();

  // If user sign up, trigger the mutation to ask user verify email
  // useEffect(() => {
  //   if (user || !email) return;

  //   // The user need to be logged in to update email
  //   async function handleSendVerificationEmail() {
  //     if (!email) return;
  //     const result = await updateEmail(email);

  //     if (result.updateEmail?.__typename === 'UpdateEmailPayload') {
  //       pushToast({
  //         children: (
  //           <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>
  //             We’ve sent a verification email to {''}
  //             <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }}>{email}</Typography>
  //           </Typography>
  //         ),
  //         position: 'top',
  //         // 50 is the height of the header, 20 is the padding
  //         offSet: 50 + 20,
  //       });
  //     }

  //     return;
  //   }

  //   handleSendVerificationEmail();
  // }, [email, pushToast, user]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleUsernameChange = useCallback((text: string) => {
    setUsernameError('');
    setUsername(text);
  }, []);

  const handleNext = useCallback(async () => {
    try {
      // If its existing user, update the username
      if (user?.username) {
        await updateUser(user.dbid, username, user.bio ?? '');

        navigation.navigate('OnboardingProfileBio');
        return;
      }

      const response = await createUser(authMechanism, username, bio);

      if (response.createUser?.__typename === 'CreateUserPayload') {
        // TODO: Remove this once incremental sync is implemented
        if (!isSyncing) {
          syncTokens('Ethereum');
        }

        const user = response.createUser.viewer?.user;

        // 1. if the the dont have ens pfp, go to the pfp screen
        // 2. if they do, go to the profile bio screen
        if (user?.potentialEnsProfileImage) {
          navigation.navigate('OnboardingProfileBio');
        } else {
          if (!isSyncing) {
            syncTokens('Ethereum');
          }

          navigation.navigate('OnboardingNftSelector', {
            page: 'Onboarding',
            fullScreen: true,
          });
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setUsernameError(error.message);
      }
    }
  }, [
    authMechanism,
    bio,
    createUser,
    isSyncing,
    navigation,
    syncTokens,
    username,
    updateUser,
    user,
  ]);

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  useEffect(
    function validateUsername() {
      setUsernameError('');

      if (debouncedUsername.length < 2) {
        return;
      }

      // if the user checking the username is the same as the user
      // that is currently logged in, then we don't need to check
      if (user?.username === debouncedUsername) {
        setIsUsernameValid(true);
        return;
      }

      const clientSideUsernameError = validate(debouncedUsername, [
        required,
        minLength(2),
        maxLength(20),
        alphanumericUnderscores,
        noConsecutivePeriodsOrUnderscores,
      ]);

      if (clientSideUsernameError) {
        setUsernameError(clientSideUsernameError);

        return;
      } else {
        setUsernameError('');
      }

      setIsCheckingUsername(true);

      isUsernameAvailableFetcher(debouncedUsername)
        .then((isUsernameAvailable) => {
          if (!isUsernameAvailable) {
            setUsernameError('Username is taken');
            setIsUsernameValid(false);
          } else {
            setIsUsernameValid(true);
          }
        })
        .catch((error) => {
          if (error instanceof Error) {
            reportError(error);
          } else {
            reportError('Failure while validating username', {
              tags: { username: debouncedUsername },
            });
          }

          setUsernameError(
            "Something went wrong while validating your username. We're looking into it."
          );
        })
        .finally(() => {
          setIsCheckingUsername(false);
        });
    },
    [debouncedUsername, isUsernameAvailableFetcher, reportError, user?.username]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ paddingTop: top }}
      className="flex flex-1 flex-col bg-white dark:bg-black-900"
    >
      <View className="flex flex-col flex-grow space-y-8 px-4">
        <View>
          <View className="relative flex-row items-center justify-between pb-4">
            <BackButton onPress={handleBack} />

            <View
              className="absolute w-full flex flex-row justify-center items-center"
              pointerEvents="none"
            >
              <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
                Pick a username
              </Typography>
            </View>

            <View />
          </View>
          <OnboardingProgressBar from={20} to={40} />
        </View>
        <View
          className="flex-1  justify-center space-y-12 px-8"
          style={{
            marginBottom: bottom,
          }}
        >
          <TextInput
            style={{
              fontSize: 32,
              fontFamily: 'GTAlpinaStandardLight',
            }}
            className="dark:text-white text-center"
            placeholderTextColor={colors.metal}
            selectionColor={colorScheme === 'dark' ? colors.offWhite : colors.black['800']}
            textAlignVertical="center"
            placeholder="username"
            value={username}
            onChange={(e) => handleUsernameChange(e.nativeEvent.text)}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View className="space-y-4">
            <Button
              onPress={handleNext}
              className={clsx(
                'w-full',
                username.length > 0 && 'opacity-100',
                username.length === 0 && 'opacity-0'
              )}
              eventElementId="Onboarding Username Next Pressed"
              eventName="Onboarding Username Next Pressed"
              eventContext={contexts.Onboarding}
              text="NEXT"
              variant={!isUsernameValid ? 'disabled' : 'primary'}
              disabled={!isUsernameValid}
              loading={isCheckingUsername}
            />
            <Typography
              className={clsx(
                'text-sm text-red',
                username.length > 0 && 'opacity-100',
                username.length === 0 && 'opacity-0'
              )}
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
            >
              {usernameError}
            </Typography>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
