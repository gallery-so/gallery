// import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
// import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { MARFA_2023_SUBMITTED_FORM_KEY } from 'src/constants/storageKeys';
import usePersistedState from 'src/hooks/usePersistedState';
import { CircleCheckIcon } from 'src/icons/CircleCheckIcon';

import { Button } from '~/components/Button';
import { MarfaCheckInSheetFragment$key } from '~/generated/MarfaCheckInSheetFragment.graphql';

// import { FeedTabNavigatorParamList, FeedTabNavigatorProp } from '~/navigation/types';
import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { Typography } from '../Typography';
import CheckInForm from './CheckInForm';
type Props = {
  viewerRef: MarfaCheckInSheetFragment$key;
  onClose: () => void;
};

export function MarfaCheckInSheet({ viewerRef, onClose }: Props) {
  const viewer = useFragment(
    graphql`
      fragment MarfaCheckInSheetFragment on Viewer {
        ...CheckInFormFragment
      }
    `,
    viewerRef
  );

  const [formSubmitted] = usePersistedState(MARFA_2023_SUBMITTED_FORM_KEY, '');
  const userAlreadySubmittedForm = formSubmitted === 'true';

  const { bottom } = useSafeAreaPadding();

  // const navigation = useNavigation<FeedTabNavigatorProp>();
  // const route = useRoute<RouteProp<FeedTabNavigatorParamList, 'For You'>>();

  // const handleOnDimiss = useCallback(() => {
  //   // update route param so the sheet can be retrigered by re-scanning the QR code
  //   if (route.params && route.params.showMarfaCheckIn) {
  //     // @ts-expect-error - showMarfaCheckIn is a valid route param for the FeedTabNavigator
  //     navigation.setParams({ ...route.params, showMarfaCheckIn: false });
  //   }
  // }, [navigation, route.params]);

  return (
    <View className="px-4 pt-2" style={{ paddingBottom: bottom }}>
      {userAlreadySubmittedForm ? (
        <View className="flex flex-col items-center h-full justify-between ">
          <View>
            <Typography
              className="text-lg text-center mb-2"
              font={{ family: 'ABCDiatype', weight: 'Bold' }}
            >
              You’re in the draw!
            </Typography>
            <Typography
              className="text-sm text-center mx-5"
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
            >
              Looks like you’ve already entered this draw. Note that there is only one entry per
              user permitted for this allowlist.
            </Typography>
          </View>
          <CircleCheckIcon />
          <Button
            className="w-full"
            onPress={onClose}
            text="Close"
            eventElementId="Marfa Check In: Already Submitted View Close Button"
            eventName="Pressed Marfa Check In: Already Submitted View Close Button"
            eventContext={null}
          />
        </View>
      ) : (
        <CheckInForm viewerRef={viewer} closeSheet={onClose} />
      )}
    </View>
  );
}
