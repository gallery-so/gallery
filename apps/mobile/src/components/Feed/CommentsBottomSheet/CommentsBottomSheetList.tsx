import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { CommentsBottomSheetLine } from '~/components/Feed/CommentsBottomSheet/CommentsBottomSheetLine';
import { CommentsBottomSheetList$key } from '~/generated/CommentsBottomSheetList.graphql';

type CommentsListProps = {
  onLoadMore: () => void;
  commentRefs: CommentsBottomSheetList$key;
};

export function CommentsBottomSheetList({ commentRefs, onLoadMore }: CommentsListProps) {
  const comments = useFragment(
    graphql`
      fragment CommentsBottomSheetList on Comment @relay(plural: true) {
        ...CommentsBottomSheetLineFragment
      }
    `,
    commentRefs
  );

  const renderItem = useCallback<ListRenderItem<(typeof comments)[number]>>(({ item: comment }) => {
    return (
      <View className="mb-4">
        <CommentsBottomSheetLine commentRef={comment} />
      </View>
    );
  }, []);

  return (
    <FlashList
      onEndReached={onLoadMore}
      renderItem={renderItem}
      data={comments}
      estimatedItemSize={24}
    />
  );
}
