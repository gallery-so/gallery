import {
  ForwardedRef,
  Suspense,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';

import { CommentsBottomSheetList } from '~/components/Feed/CommentsBottomSheet/CommentsBottomSheetList';
import { CommentBox } from '~/components/Feed/Socialize/CommentBox';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';
import { CommentsBottomSheetConnectedCommentsListFragment$key } from '~/generated/CommentsBottomSheetConnectedCommentsListFragment.graphql';
import { CommentsBottomSheetConnectedCommentsListPaginationQuery } from '~/generated/CommentsBottomSheetConnectedCommentsListPaginationQuery.graphql';
import { CommentsBottomSheetConnectedCommentsListQuery } from '~/generated/CommentsBottomSheetConnectedCommentsListQuery.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import useKeyboardStatus from '../../../utils/useKeyboardStatus';

const SNAP_POINTS = [350];

type CommentsBottomSheetProps = {
  feedEventId: string;
  bottomSheetRef: ForwardedRef<GalleryBottomSheetModalType>;
};

export function CommentsBottomSheet({ bottomSheetRef, feedEventId }: CommentsBottomSheetProps) {
  const internalRef = useRef<GalleryBottomSheetModalType | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { bottom } = useSafeAreaPadding();
  const isKeyboardActive = useKeyboardStatus();
  const paddingBottomValue = useSharedValue(0);
  const paddingStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: paddingBottomValue.value,
    };
  });

  useLayoutEffect(() => {
    if (isKeyboardActive) {
      paddingBottomValue.value = withSpring(0, { overshootClamping: true });
    } else {
      paddingBottomValue.value = withSpring(bottom, { overshootClamping: true });
    }
  }, [bottom, isKeyboardActive, paddingBottomValue]);

  return (
    <GalleryBottomSheetModal
      ref={(value) => {
        internalRef.current = value;
        if (typeof bottomSheetRef === 'function') {
          bottomSheetRef(value);
        } else if (bottomSheetRef) {
          bottomSheetRef.current = value;
        }
      }}
      snapPoints={SNAP_POINTS}
      onChange={() => setIsOpen(true)}
      android_keyboardInputMode="adjustResize"
      keyboardBlurBehavior="restore"
    >
      <Animated.View style={paddingStyle} className="flex flex-1 flex-col space-y-5">
        <Typography className="text-sm px-4" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          Comments
        </Typography>

        <View className="flex-grow">
          <Suspense fallback={null}>
            {isOpen && <ConnectedCommentsList feedEventId={feedEventId} />}
          </Suspense>
        </View>

        <CommentBox feedEventId={feedEventId} onClose={() => {}} />
      </Animated.View>
    </GalleryBottomSheetModal>
  );
}

type ConnectedCommentsListProps = {
  feedEventId: string;
};

function ConnectedCommentsList({ feedEventId }: ConnectedCommentsListProps) {
  const queryRef = useLazyLoadQuery<CommentsBottomSheetConnectedCommentsListQuery>(
    graphql`
      query CommentsBottomSheetConnectedCommentsListQuery(
        $feedEventId: DBID!
        $last: Int!
        $before: String
      ) {
        ...CommentsBottomSheetConnectedCommentsListFragment
      }
    `,
    { feedEventId, last: 10 }
  );

  const {
    data: query,
    loadPrevious,
    hasPrevious,
  } = usePaginationFragment<
    CommentsBottomSheetConnectedCommentsListPaginationQuery,
    CommentsBottomSheetConnectedCommentsListFragment$key
  >(
    graphql`
      fragment CommentsBottomSheetConnectedCommentsListFragment on Query
      @refetchable(queryName: "CommentsBottomSheetConnectedCommentsListPaginationQuery") {
        feedEventById(id: $feedEventId) {
          ... on FeedEvent {
            comments(last: $last, before: $before)
              @connection(key: "CommentsBottomSheet_comments") {
              edges {
                node {
                  ...CommentsBottomSheetList
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const comments = useMemo(() => {
    return removeNullValues(
      query.feedEventById?.comments?.edges?.map((edge) => edge?.node)
    ).reverse();
  }, [query.feedEventById?.comments?.edges]);

  const handleLoadMore = useCallback(() => {
    if (hasPrevious) {
      loadPrevious(10);
    }
  }, [hasPrevious, loadPrevious]);

  return (
    <View className="flex-1">
      <CommentsBottomSheetList onLoadMore={handleLoadMore} commentRefs={comments} />
    </View>
  );
}
