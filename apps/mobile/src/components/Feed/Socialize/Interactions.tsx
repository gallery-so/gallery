import { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { AdmireBottomSheet } from '~/components/Feed/AdmireBottomSheet/AdmireBottomSheet';
import { AdmireLine } from '~/components/Feed/Socialize/AdmireLine';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { ProfilePictureBubblesWithCount } from '~/components/ProfileView/ProfileViewSharedInfo/ProfileViewSharedFollowers';
import { InteractionsAdmiresFragment$key } from '~/generated/InteractionsAdmiresFragment.graphql';
import { InteractionsCommentsFragment$key } from '~/generated/InteractionsCommentsFragment.graphql';
import { contexts } from '~/shared/analytics/constants';

import { FeedItemTypes } from '../createVirtualizedFeedEventItems';
import { CommentLine } from './CommentLine';
import { RemainingCommentCount } from './RemainingCommentCount';

const PREVIEW_COMMENT_COUNT = 1;

type Props = {
  type: FeedItemTypes;
  feedId: string;
  admireRefs: InteractionsAdmiresFragment$key;
  commentRefs: InteractionsCommentsFragment$key;
  totalAdmires: number;
  totalComments: number;

  onAdmirePress: () => void;
  openCommentBottomSheet: () => void;
};

export function Interactions({
  type,
  feedId,
  admireRefs,
  commentRefs,
  totalAdmires,
  totalComments,
  onAdmirePress,
  openCommentBottomSheet,
}: Props) {
  const comments = useFragment(
    graphql`
      fragment InteractionsCommentsFragment on Comment @relay(plural: true) {
        dbid
        ...CommentLineFragment
      }
    `,
    commentRefs
  );

  const admires = useFragment(
    graphql`
      fragment InteractionsAdmiresFragment on Admire @relay(plural: true) {
        dbid
        admirer {
          ...AdmireLineFragment
          ...ProfileViewSharedFollowersBubblesFragment
        }
      }
    `,
    admireRefs
  );

  const handleSeeAllAdmires = useCallback(() => {
    admiresBottomSheetRef.current?.present();
  }, []);

  const admireUsers = useMemo(() => {
    const users = [];
    for (const admire of admires) {
      if (admire?.admirer) {
        users.push(admire.admirer);
      }
    }
    return users;
  }, [admires]);

  const previewComments = comments.slice(-PREVIEW_COMMENT_COUNT);

  const admiresBottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

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

      <View className="flex flex-col space-y-1">
        {previewComments.map((comment) => {
          return (
            <CommentLine
              key={comment.dbid}
              commentRef={comment}
              onCommentPress={openCommentBottomSheet}
            />
          );
        })}

        {totalComments > 1 && (
          <RemainingCommentCount totalCount={totalComments} onPress={openCommentBottomSheet} />
        )}
      </View>

      <AdmireBottomSheet type={type} feedId={feedId} bottomSheetRef={admiresBottomSheetRef} />
    </View>
  );
}
