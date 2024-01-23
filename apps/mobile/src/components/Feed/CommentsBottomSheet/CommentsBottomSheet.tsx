import {
  ForwardedRef,
  Suspense,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Keyboard, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
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
import { SearchResultsFallback } from '~/components/Search/SearchResultFallback';
import { SearchResults } from '~/components/Search/SearchResults';
import { Typography } from '~/components/Typography';
import { CommentsBottomSheetConnectedCommentsListFragment$key } from '~/generated/CommentsBottomSheetConnectedCommentsListFragment.graphql';
import { CommentsBottomSheetConnectedCommentsListPaginationQuery } from '~/generated/CommentsBottomSheetConnectedCommentsListPaginationQuery.graphql';
import { CommentsBottomSheetConnectedCommentsListQuery } from '~/generated/CommentsBottomSheetConnectedCommentsListQuery.graphql';
import { CommentsBottomSheetConnectedPostCommentsListFragment$key } from '~/generated/CommentsBottomSheetConnectedPostCommentsListFragment.graphql';
import { CommentsBottomSheetConnectedPostCommentsListQuery } from '~/generated/CommentsBottomSheetConnectedPostCommentsListQuery.graphql';
import { useMentionableMessage } from '~/shared/hooks/useMentionableMessage';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { noop } from '~/shared/utils/noop';

import useKeyboardStatus from '../../../utils/useKeyboardStatus';
import { FeedItemTypes } from '../createVirtualizedFeedEventItems';
import { CommentListFallback } from './CommentListFallback';
import { OnReplyPressParams } from './CommentsBottomSheetLine';
import { CommentsRepliedBanner } from './CommentsRepliedBanner';
import { REPLIES_PER_PAGE } from './constants';

type CommentsBottomSheetProps = {
  activeCommentId?: string;
  replyToComment?: OnReplyPressParams;
  feedId: string;
  bottomSheetRef: ForwardedRef<GalleryBottomSheetModalType>;
  type: FeedItemTypes;
};

export function CommentsBottomSheet({
  activeCommentId,
  bottomSheetRef,
  feedId,
  replyToComment,
  type,
}: CommentsBottomSheetProps) {
  const internalRef = useRef<GalleryBottomSheetModalType | null>(null);
  const commentBoxRef = useRef<TextInput>(null);

  const [isOpen, setIsOpen] = useState(false);

  const { bottom } = useSafeAreaPadding();
  const isKeyboardActive = useKeyboardStatus();
  const paddingBottomValue = useSharedValue(0);
  const paddingStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: paddingBottomValue.value,
    };
  });

  const [selectedComment, setSelectedComment] = useState<OnReplyPressParams>(
    replyToComment || null
  );
  const topCommentId = useRef<string | null>(replyToComment?.topCommentId ?? null);

  const { submitComment, isSubmittingComment } = useEventComment();
  const { submitComment: postComment, isSubmittingComment: isSubmittingPostComment } =
    usePostComment();

  const snapPoints = [600];

  const {
    aliasKeyword,
    isSelectingMentions,
    selectMention,
    mentions,
    setMessage,
    message,
    resetMentions,
    handleSelectionChange,
  } = useMentionableMessage();

  const highlightCommentId = useMemo(() => {
    if (selectedComment?.commentId) {
      return selectedComment.commentId;
    }

    if (activeCommentId) {
      return activeCommentId;
    }

    return undefined;
  }, [activeCommentId, selectedComment?.commentId]);

  const handleSubmit = useCallback(
    (value: string) => {
      if (type === 'Post') {
        postComment({
          feedId,
          value,
          mentions,
          replyToId: selectedComment ? selectedComment.commentId : undefined,
          onSuccess: () => {
            Keyboard.dismiss();
            setSelectedComment(null);
            topCommentId.current = null;
          },
          topCommentId: topCommentId.current ?? undefined,
        });

        resetMentions();
        return;
      }

      submitComment({
        feedEventId: feedId,
        value,
        onSuccess: () => {
          Keyboard.dismiss();
          setSelectedComment(null);
          topCommentId.current = null;
        },
      });
    },
    [feedId, type, mentions, submitComment, postComment, resetMentions, selectedComment]
  );

  const isSubmitting = useMemo(() => {
    if (type === 'Post') {
      return isSubmittingPostComment;
    }

    return isSubmittingComment;
  }, [isSubmittingComment, isSubmittingPostComment, type]);

  const handleReplyPress = useCallback((params: OnReplyPressParams) => {
    setSelectedComment(params);
    if (params?.topCommentId) {
      topCommentId.current = params.topCommentId;
    } else {
      topCommentId.current = null;
    }
    commentBoxRef.current?.focus();
  }, []);

  useLayoutEffect(() => {
    if (isKeyboardActive) {
      paddingBottomValue.value = withSpring(0, { overshootClamping: true });
    } else {
      paddingBottomValue.value = withSpring(bottom, { overshootClamping: true });
    }
  }, [bottom, isKeyboardActive, paddingBottomValue]);

  const handleDismiss = useCallback(() => {
    resetMentions();
    setSelectedComment(null);
    topCommentId.current = null;
  }, [resetMentions]);

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
      snapPoints={snapPoints}
      onChange={() => setIsOpen(true)}
      android_keyboardInputMode="adjustResize"
      keyboardBlurBehavior="restore"
      onDismiss={handleDismiss}
    >
      <Animated.View style={paddingStyle} className="flex flex-1 flex-col space-y-5">
        <View className="flex-grow">
          {isSelectingMentions ? (
            <View className="flex-1 overflow-hidden">
              {aliasKeyword ? (
                <Suspense fallback={<SearchResultsFallback />}>
                  <SearchResults
                    keyword={aliasKeyword}
                    activeFilter="top"
                    onChangeFilter={noop}
                    blurInputFocus={noop}
                    onSelect={selectMention}
                    onlyShowTopResults
                    isMentionSearch
                  />
                </Suspense>
              ) : (
                <SearchResultsFallback />
              )}
            </View>
          ) : (
            <View className="flex-1 space-y-2">
              <Typography className="text-sm px-4" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
                Comments
              </Typography>
              <View className="flex-grow">
                <Suspense fallback={<CommentListFallback />}>
                  {isOpen && (
                    <ConnectedCommentsList
                      type={type}
                      feedId={feedId}
                      activeCommentId={highlightCommentId}
                      onReplyPress={handleReplyPress}
                    />
                  )}
                </Suspense>
              </View>
            </View>
          )}
        </View>

        <CommentsRepliedBanner
          username={selectedComment?.username ?? ''}
          comment={selectedComment?.comment ?? ''}
          onClose={() => {
            setSelectedComment(null);
            topCommentId.current = null;
          }}
        />

        <CommentBox
          value={message}
          onChangeText={setMessage}
          onSelectionChange={handleSelectionChange}
          onSubmit={handleSubmit}
          isSubmittingComment={isSubmitting}
          onClose={noop}
          ref={commentBoxRef}
          mentions={mentions}
          autoFocus={Boolean(selectedComment?.commentId)}
        />
      </Animated.View>
    </GalleryBottomSheetModal>
  );
}

type ConnectedCommentsListProps = {
  type: FeedItemTypes;
  feedId: string;
  activeCommentId?: string;
  onReplyPress: (params: OnReplyPressParams) => void;
};

function ConnectedCommentsList({
  type,
  feedId,
  activeCommentId,
  onReplyPress,
}: ConnectedCommentsListProps) {
  if (type === 'Post') {
    return (
      <ConnectedPostCommentsList
        feedId={feedId}
        activeCommentId={activeCommentId}
        onReplyPress={onReplyPress}
      />
    );
  }

  return (
    <ConnectedEventCommentsList
      feedId={feedId}
      activeCommentId={activeCommentId}
      onReplyPress={onReplyPress}
    />
  );
}

type ConnectedCommentsProps = {
  activeCommentId?: string;
  feedId: string;
  onReplyPress: (params: OnReplyPressParams) => void;
};

function ConnectedEventCommentsList({
  activeCommentId,
  feedId,
  onReplyPress,
}: ConnectedCommentsProps) {
  const queryRef = useLazyLoadQuery<CommentsBottomSheetConnectedCommentsListQuery>(
    graphql`
      query CommentsBottomSheetConnectedCommentsListQuery(
        $feedEventId: DBID!
        $last: Int!
        $before: String
        $replyLast: Int!
        $replyBefore: String
      ) {
        ...CommentsBottomSheetConnectedCommentsListFragment
      }
    `,
    { feedEventId: feedId, last: 10, replyLast: REPLIES_PER_PAGE },
    { fetchPolicy: 'store-and-network' }
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
        ...CommentsBottomSheetListQueryFragment
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
        <CommentsBottomSheetList
          onLoadMore={handleLoadMore}
          commentRefs={comments}
          queryRef={query}
          activeCommentId={activeCommentId}
          onReply={onReplyPress}
        />
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

function ConnectedPostCommentsList({
  activeCommentId,
  feedId,
  onReplyPress,
}: ConnectedCommentsProps) {
  const queryRef = useLazyLoadQuery<CommentsBottomSheetConnectedPostCommentsListQuery>(
    graphql`
      query CommentsBottomSheetConnectedPostCommentsListQuery(
        $feedEventId: DBID!
        $last: Int!
        $before: String
        $replyLast: Int!
        $replyBefore: String
      ) {
        ...CommentsBottomSheetConnectedPostCommentsListFragment
      }
    `,
    { feedEventId: feedId, last: 10, replyLast: REPLIES_PER_PAGE },
    { fetchPolicy: 'store-and-network' }
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
        ...CommentsBottomSheetListQueryFragment
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
        <CommentsBottomSheetList
          onLoadMore={handleLoadMore}
          commentRefs={comments}
          queryRef={query}
          activeCommentId={activeCommentId}
          onReply={onReplyPress}
        />
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
