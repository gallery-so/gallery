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
import { Keyboard } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import { useEventComment } from 'src/hooks/useEventComment';
import { usePostComment } from 'src/hooks/usePostComment';

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
import { CommentsBottomSheetConnectedPostCommentsListFragment$key } from '~/generated/CommentsBottomSheetConnectedPostCommentsListFragment.graphql';
import { CommentsBottomSheetConnectedPostCommentsListQuery } from '~/generated/CommentsBottomSheetConnectedPostCommentsListQuery.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import useKeyboardStatus from '../../../utils/useKeyboardStatus';
import { FeedItemTypes } from '../createVirtualizedFeedEventItems';
import { CommentListFallback } from './CommentListFallback';

const SNAP_POINTS = [400];

type CommentsBottomSheetProps = {
  feedId: string;
  bottomSheetRef: ForwardedRef<GalleryBottomSheetModalType>;
  type: FeedItemTypes;
};

export function CommentsBottomSheet({ bottomSheetRef, feedId, type }: CommentsBottomSheetProps) {
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

  const { submitComment, isSubmittingComment } = useEventComment();
  const { submitComment: postComment, isSubmittingComment: isSubmittingPostComment } =
    usePostComment();

  const handleSubmit = useCallback(
    (value: string) => {
      if (type === 'Post') {
        postComment({
          feedId,
          value,
          onSuccess: () => {
            Keyboard.dismiss();
          },
        });
        return;
      }

      submitComment({
        feedEventId: feedId,
        value,
        onSuccess: () => {
          Keyboard.dismiss();
        },
      });
    },
    [feedId, type, submitComment, postComment]
  );

  const isSubmitting = useMemo(() => {
    if (type === 'Post') {
      return isSubmittingPostComment;
    }

    return isSubmittingComment;
  }, [isSubmittingComment, isSubmittingPostComment, type]);

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

        <View className="flex-grow px-1">
          <Suspense fallback={<CommentListFallback />}>
            {isOpen && <ConnectedCommentsList type={type} feedId={feedId} />}
          </Suspense>
        </View>

        <CommentBox onSubmit={handleSubmit} isSubmittingComment={isSubmitting} onClose={() => {}} />
      </Animated.View>
    </GalleryBottomSheetModal>
  );
}

type ConnectedCommentsListProps = {
  type: FeedItemTypes;
  feedId: string;
};

function ConnectedCommentsList({ type, feedId }: ConnectedCommentsListProps) {
  if (type === 'Post') {
    return <ConnectedPostCommentsList feedId={feedId} />;
  }

  return <ConnectedEventCommentsList feedId={feedId} />;
}

function ConnectedEventCommentsList({ feedId }: { feedId: string }) {
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
    { feedEventId: feedId, last: 10 }
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
      {comments.length > 0 ? (
        <CommentsBottomSheetList onLoadMore={handleLoadMore} commentRefs={comments} />
      ) : (
        <View className="flex items-center justify-center h-full">
          <Typography
            className="text-sm px-4 text-shadow"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            No comments yet
          </Typography>
        </View>
      )}
    </View>
  );
}

function ConnectedPostCommentsList({ feedId }: { feedId: string }) {
  const queryRef = useLazyLoadQuery<CommentsBottomSheetConnectedPostCommentsListQuery>(
    graphql`
      query CommentsBottomSheetConnectedPostCommentsListQuery(
        $feedEventId: DBID!
        $last: Int!
        $before: String
      ) {
        ...CommentsBottomSheetConnectedPostCommentsListFragment
      }
    `,
    { feedEventId: feedId, last: 10 }
  );

  const {
    data: query,
    loadPrevious,
    hasPrevious,
  } = usePaginationFragment<
    CommentsBottomSheetConnectedCommentsListPaginationQuery,
    CommentsBottomSheetConnectedPostCommentsListFragment$key
  >(
    graphql`
      fragment CommentsBottomSheetConnectedPostCommentsListFragment on Query
      @refetchable(queryName: "CommentsBottomSheetConnectedPostCommentsListPaginationQuery") {
        postById(id: $feedEventId) {
          ... on Post {
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
    return removeNullValues(query.postById?.comments?.edges?.map((edge) => edge?.node));
  }, [query.postById?.comments?.edges]);

  const handleLoadMore = useCallback(() => {
    if (hasPrevious) {
      loadPrevious(10);
    }
  }, [hasPrevious, loadPrevious]);

  return (
    <View className="flex-1">
      {comments.length > 0 ? (
        <CommentsBottomSheetList onLoadMore={handleLoadMore} commentRefs={comments} />
      ) : (
        <View className="flex items-center justify-center h-full">
          <Typography
            className="text-sm px-4 text-shadow"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            No comments yet
          </Typography>
        </View>
      )}
    </View>
  );
}
