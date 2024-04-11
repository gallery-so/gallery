import { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { AdmireBottomSheet } from '~/components/Feed/AdmireBottomSheet/AdmireBottomSheet';
import { AdmireLine } from '~/components/Feed/Socialize/AdmireLine';
import { ProfilePictureBubblesWithCount } from '~/components/ProfileView/ProfileViewSharedInfo/ProfileViewSharedFollowers';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { AdmiresFragment$key } from '~/generated/AdmiresFragment.graphql';
import { contexts } from '~/shared/analytics/constants';

import { FeedItemTypes } from '../createVirtualizedFeedEventItems';

type Props = {
  type: FeedItemTypes;
  feedId: string;
  admireRefs: AdmiresFragment$key;
  totalAdmires: number;
  onAdmirePress: () => void;
  openCommentBottomSheet: () => void;
};

export function Admires({ type, feedId, admireRefs, totalAdmires, onAdmirePress }: Props) {
  const admires = useFragment(
    graphql`
      fragment AdmiresFragment on Admire @relay(plural: true) {
        admirer {
          ...AdmireLineFragment
          ...ProfileViewSharedFollowersBubblesFragment
        }
      }
    `,
    admireRefs
  );

  const { showBottomSheetModal, hideBottomSheetModal } = useBottomSheetModalActions();

  const handleSeeAllAdmires = useCallback(() => {
    showBottomSheetModal({
      content: <AdmireBottomSheet type={type} feedId={feedId} onClose={hideBottomSheetModal} />,
    });
  }, [feedId, hideBottomSheetModal, showBottomSheetModal, type]);

  const admireUsers = useMemo(() => {
    const users = [];
    for (const admire of admires) {
      if (admire?.admirer) {
        users.push(admire.admirer);
      }
    }
    return users;
  }, [admires]);

  return (
    <View className="flex flex-col space-y-2">
      <View className="flex flex-row space-x-1 items-center">
        {admireUsers.length > 0 && (
          <ProfilePictureBubblesWithCount
            eventName="Feed Event Admire Bubbles Pressed"
            eventElementId="Feed Event Admire Bubbles"
            eventContext={contexts.Posts}
            onPress={handleSeeAllAdmires}
            userRefs={admireUsers}
            totalCount={totalAdmires}
          />
        )}

        <AdmireLine
          onMultiUserPress={handleSeeAllAdmires}
          userRefs={admireUsers}
          totalAdmires={totalAdmires}
          onAdmirePress={onAdmirePress}
        />
      </View>
    </View>
  );
}
