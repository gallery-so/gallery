import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { CommentsBottomSheetLine } from '~/components/Feed/CommentsBottomSheet/CommentsBottomSheetLine';
import { CommentsListFragment$key } from '~/generated/CommentsListFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type CommentsListProps = {
  feedEventRef: CommentsListFragment$key;
};

export function CommentsList({ feedEventRef }: CommentsListProps) {
  const feedEvent = useFragment(
    graphql`
      fragment CommentsListFragment on FeedEvent {
        comments {
          edges {
            node {
              ...CommentsBottomSheetLineFragment
            }
          }
        }
      }
    `,
    feedEventRef
  );

  const comments = removeNullValues(feedEvent.comments?.edges?.map((edge) => edge?.node));

  const renderItem = useCallback<ListRenderItem<(typeof comments)[number]>>(({ item: comment }) => {
    return <CommentsBottomSheetLine commentRef={comment} />;
  }, []);

  return <FlashList renderItem={renderItem} data={comments} />;
}
