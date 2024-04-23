import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { useToggleAdmire } from 'src/hooks/useToggleAdmire';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { FeedEventSocializeSectionFragment$key } from '~/generated/FeedEventSocializeSectionFragment.graphql';
import { FeedEventSocializeSectionQueryFragment$key } from '~/generated/FeedEventSocializeSectionQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import { CommentsBottomSheet } from '../CommentsBottomSheet/CommentsBottomSheet';
import { AdmireButton } from './AdmireButton';
import { Admires } from './Admires';
import { CommentButton } from './CommentButton';
import Comments from './Comments';

type Props = {
  feedEventRef: FeedEventSocializeSectionFragment$key;
  queryRef: FeedEventSocializeSectionQueryFragment$key;
  onCommentPress: () => void;
};

export function FeedEventSocializeSection({ feedEventRef, queryRef, onCommentPress }: Props) {
  const event = useFragment(
    graphql`
      fragment FeedEventSocializeSectionFragment on FeedEvent {
        dbid
        eventData {
          ... on UserFollowedUsersFeedEventData {
            __typename
          }
        }

        # We only show 1 but in case the user deletes something
        # we want to be sure that we can show another comment beneath
        admires(last: 5) @connection(key: "Interactions_admires") {
          pageInfo {
            total
          }
          edges {
            node {
              dbid
              ...AdmiresFragment
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
              ...CommentsFragment
            }
          }
        }

        ...useToggleAdmireFragment
      }
    `,
    feedEventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventSocializeSectionQueryFragment on Query {
        ...useToggleAdmireQueryFragment
      }
    `,
    queryRef
  );

  const { toggleAdmire, hasViewerAdmiredEvent } = useToggleAdmire({
    eventRef: event,
    queryRef: query,
  });

  const nonNullComments = useMemo(() => {
    const comments = [];

    for (const edge of event.comments?.edges ?? []) {
      if (edge?.node) {
        comments.push(edge.node);
      }
    }

    return comments;
  }, [event.comments?.edges]);

  const totalComments = event.comments?.pageInfo?.total ?? 0;

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

  const totalAdmires = event.admires?.pageInfo?.total ?? 0;
  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const { showBottomSheetModal } = useBottomSheetModalActions();
  const handleOpenCommentBottomSheet = useCallback(() => {
    showBottomSheetModal({
      content: <CommentsBottomSheet type="FeedEvent" feedId={event.dbid} />,
      navigationContext: navigation,
    });
    onCommentPress();
  }, [event.dbid, navigation, onCommentPress, showBottomSheetModal]);

  if (event.eventData?.__typename === 'UserFollowedUsersFeedEventData') {
    return <View className="pb-6" />;
  }

  return (
    <>
      <View className="px-3 pb-8 pt-5">
        <View className="flex flex-row justify-between">
          <View className="flex-1 pr-4 pt-1">
            <Admires
              type="FeedEvent"
              feedId={event.dbid}
              admireRefs={nonNullAdmires}
              totalAdmires={totalAdmires}
              onAdmirePress={toggleAdmire}
              openCommentBottomSheet={handleOpenCommentBottomSheet}
            />
          </View>

          <View className="flex flex-row space-x-1">
            <AdmireButton onPress={toggleAdmire} isAdmired={hasViewerAdmiredEvent} />
            <CommentButton openCommentBottomSheet={handleOpenCommentBottomSheet} />
          </View>
        </View>
        <Comments
          commentRefs={nonNullComments}
          totalComments={totalComments}
          onCommentPress={handleOpenCommentBottomSheet}
        />
      </View>
    </>
  );
}
