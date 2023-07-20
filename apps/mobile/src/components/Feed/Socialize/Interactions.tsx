import { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { AdmireBottomSheet } from '~/components/Feed/AdmireBottomSheet/AdmireBottomSheet';
import { CommentsBottomSheet } from '~/components/Feed/CommentsBottomSheet/CommentsBottomSheet';
import { AdmireLine } from '~/components/Feed/Socialize/AdmireLine';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { ProfilePictureBubblesWithCount } from '~/components/ProfileView/ProfileViewSharedInfo/ProfileViewSharedFollowers';
import { InteractionsFragment$key } from '~/generated/InteractionsFragment.graphql';

import { CommentLine } from './CommentLine';
import { RemainingCommentCount } from './RemainingCommentCount';

const PREVIEW_COMMENT_COUNT = 1;

type Props = {
  eventRef: InteractionsFragment$key;
};

export function Interactions({ eventRef }: Props) {
  const event = useFragment(
    graphql`
      fragment InteractionsFragment on FeedEvent {
        dbid
        # We only show 1 but in case the user deletes something
        # we want to be sure that we can show another comment beneath
        admires(last: 5) @connection(key: "Interactions_admires") {
          pageInfo {
            total
          }
          edges {
            node {
              dbid
              admirer {
                ...AdmireLineFragment
                ...ProfileViewSharedFollowersBubblesFragment
              }
            }
          }
        }

        # We only show 2 but in case the user deletes something
        # we want to be sure that we can show another comment beneath
        comments(last: 5) @connection(key: "Interactions_comments") {
          pageInfo {
            total
          }
          edges {
            node {
              dbid
              ...CommentLineFragment
            }
          }
        }
      }
    `,
    eventRef
  );

  const handleSeeAllAdmires = useCallback(() => {
    admiresBottomSheetRef.current?.present();
  }, []);

  const handleSeeAllComments = useCallback(() => {
    commentsBottomSheetRef.current?.present();
  }, []);

  const nonNullComments = useMemo(() => {
    const comments = [];

    for (const edge of event.comments?.edges ?? []) {
      if (edge?.node) {
        comments.push(edge.node);
      }
    }

    return comments;
  }, [event.comments?.edges]);

  const nonNullAdmires = useMemo(() => {
    const admires = [];

    for (const edge of event.admires?.edges ?? []) {
      if (edge?.node) {
        admires.push(edge.node);
      }
    }

    admires.reverse();

    return admires;
  }, [event.admires?.edges]);

  const admireUsers = useMemo(() => {
    const users = [];
    for (const admire of nonNullAdmires) {
      if (admire?.admirer) {
        users.push(admire.admirer);
      }
    }
    return users;
  }, [nonNullAdmires]);

  const totalComments = event.comments?.pageInfo.total ?? 0;
  const totalAdmires = event.admires?.pageInfo.total ?? 0;

  const previewComments = nonNullComments.slice(-PREVIEW_COMMENT_COUNT);

  const commentsBottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const admiresBottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  return (
    <View className="flex flex-col space-y-1">
      <View className="flex flex-row space-x-1 items-center">
        <ProfilePictureBubblesWithCount
          eventName="Feed Event Admire Bubbles Pressed"
          eventElementId="Feed Event Admire Bubbles"
          onPress={handleSeeAllAdmires}
          userRefs={admireUsers}
          totalCount={totalAdmires}
        />

        <AdmireLine
          onMultiUserPress={handleSeeAllAdmires}
          userRefs={admireUsers}
          totalAdmires={totalAdmires}
        />
      </View>

      {previewComments.map((comment) => {
        return <CommentLine key={comment.dbid} commentRef={comment} />;
      })}

      {totalComments > 1 && (
        <RemainingCommentCount totalCount={totalComments} onPress={handleSeeAllComments} />
      )}

      <CommentsBottomSheet feedEventId={event.dbid} bottomSheetRef={commentsBottomSheetRef} />

      <AdmireBottomSheet feedEventId={event.dbid} bottomSheetRef={admiresBottomSheetRef} />
    </View>
  );
}
