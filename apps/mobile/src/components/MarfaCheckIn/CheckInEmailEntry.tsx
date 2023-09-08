import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { MARFA_2023_SUBMITTED_FORM_KEY } from 'src/constants/storageKeys';
import usePersistedState from 'src/hooks/usePersistedState';
import { CircleCheckIcon } from 'src/icons/CircleCheckIcon';
import { SpinnerIcon } from 'src/icons/SpinnerIcon';

import { Button } from '~/components/Button';
import { CheckInEmailEntryFragment$key } from '~/generated/CheckInEmailEntryFragment.graphql';
import colors from '~/shared/theme/colors';

import { BackButton } from '../BackButton';
import { Typography } from '../Typography';
import { env } from '~/env/runtime';

type Props = {
  viewerRef: CheckInEmailEntryFragment$key;
  setConfirmedWalletAddress: (walletAddress: string) => void;
  confirmedWalletAddress: string;
  closeSheet: () => void;
};
export default function CheckInEmailEntry({
  viewerRef,
  setConfirmedWalletAddress,
  confirmedWalletAddress,
  closeSheet,
}: Props) {
  const viewer = useFragment(
    graphql`
      fragment CheckInEmailEntryFragment on Viewer {
        __typename
        email {
          email
        }
        user {
          username
        }
      }
    `,
    viewerRef
  );

  const [, setFormSubmittedFlag] = usePersistedState(MARFA_2023_SUBMITTED_FORM_KEY, '');
  const [status, setStatus] = useState<'SUBMITTING' | 'SUCCESS' | 'ERROR' | undefined>();

  const [email, setEmail] = useState(viewer.email?.email ?? '');

  const handleSubmitPress = useCallback(async () => {
    setStatus('SUBMITTING');

    try {
      const response = await fetch(`https://formspree.io/f/${env.FORMSPREE_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          walletAddress: confirmedWalletAddress,
          username: viewer.user?.username,
        }),
      });

      if (response.status === 200) {
        setFormSubmittedFlag('true');
        setStatus('SUCCESS');
      } else {
        setStatus('ERROR');
      }
    } catch (error) {
      setStatus('ERROR');
    }
  }, [confirmedWalletAddress, email, setFormSubmittedFlag, viewer.user?.username]);

  const isEmailValid = useMemo(() => {
    return Boolean(email);
  }, [email]);

  const { colorScheme } = useColorScheme();

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
  }, []);

  const handleBackPress = useCallback(() => {
    setConfirmedWalletAddress('');
  }, [setConfirmedWalletAddress]);

  if (status === 'SUBMITTING') {
    return (
      <View className=" items-center">
        <Typography className="text-lg text-center" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          Entering you into the draw...
        </Typography>
        <SpinnerIcon spin />
      </View>
    );
  }

  if (status === 'SUCCESS') {
    return (
      <View className="flex flex-col items-center h-full justify-between ">
        <View>
          <Typography
            className="text-lg text-center mb-2"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            You’re in the draw!
          </Typography>
          <Typography
            className="text-sm text-center"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            Good luck! Allowlist winners will be announced at the event.
          </Typography>
        </View>
        <CircleCheckIcon />
        <Button
          className="w-full"
          onPress={closeSheet}
          text="Close"
          eventElementId="Marfa Check In: Submission Success Close Button"
          eventName="Pressed Marfa Check In: Submission Success Close Button"
        />
      </View>
    );
  }

  return (
    <View>
      <View className="flex flex-row space-x-2 mb-4 items-center">
        <BackButton onPress={handleBackPress} size="sm" />
        <Typography className="text-lg" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          Enter email
        </Typography>
      </View>
      <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
        Enter your email and we’ll let you know if you win an allowlist spot.
      </Typography>
      <View className="dark:text-white p-4 my-4 bg-faint">
        <BottomSheetTextInput
          value={email}
          autoFocus
          onChangeText={handleEmailChange}
          autoCapitalize="none"
          autoComplete="off"
          placeholderTextColor={colors.metal}
          textAlignVertical="center"
          placeholder="Email address"
          style={{ color: colorScheme === 'dark' ? colors.white : colors.black['800'] }}
        />
      </View>
      <Button
        onPress={handleSubmitPress}
        text="Submit"
        disabled={!isEmailValid}
        eventElementId={null}
        eventName={null}
      />
      {status === 'ERROR' && (
        <Typography
          className="text-sm mt-4 text-error text-center"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          There was an error while submitting your entry. Please try again or reach out to the
          Gallery team.
        </Typography>
      )}
    </View>
  );
}
