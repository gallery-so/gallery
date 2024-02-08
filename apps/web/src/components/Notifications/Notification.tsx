import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { ConnectionHandler, graphql } from 'relay-runtime';
import styled, { css } from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { SomeoneAdmiredYourFeedEvent } from '~/components/Notifications/notifications/SomeoneAdmiredYourFeedEvent';
import { SomeoneCommentedOnYourFeedEvent } from '~/components/Notifications/notifications/SomeoneCommentedOnYourFeedEvent';
import { SomeoneFollowedYou } from '~/components/Notifications/notifications/SomeoneFollowedYou';
import { SomeoneFollowedYouBack } from '~/components/Notifications/notifications/SomeoneFollowedYouBack';
import { SomeoneViewedYourGallery } from '~/components/Notifications/notifications/SomeoneViewedYourGallery';
import { NotificationUserListPage } from '~/components/Notifications/NotificationUserListPage';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { NotificationFragment$key } from '~/generated/NotificationFragment.graphql';
import { NotificationInnerFragment$key } from '~/generated/NotificationInnerFragment.graphql';
import { NotificationInnerQueryFragment$key } from '~/generated/NotificationInnerQueryFragment.graphql';
import { NotificationQueryFragment$key } from '~/generated/NotificationQueryFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { useClearNotifications } from '~/shared/relay/useClearNotifications';
import colors from '~/shared/theme/colors';

import { GalleryAnnouncement } from './notifications/GalleryAnnouncement';
import { NewTokens, StyledPostPreview } from './notifications/NewTokens';
import SomeoneAdmiredYourComment from './notifications/SomeoneAdmiredYourComment';
import SomeoneAdmiredYourPost from './notifications/SomeoneAdmiredYourPost';
import SomeoneAdmiredYourToken from './notifications/SomeoneAdmiredYourToken';
import SomeoneCommentedOnYourPost from './notifications/SomeoneCommentedOnYourPost';
import { SomeoneMentionedYou } from './notifications/SomeoneMentionedYou';
import { SomeoneMentionedYourCommunity } from './notifications/SomeoneMentionedYourCommunity';
import SomeonePostedYourWork from './notifications/SomeonePostedYourWork';
import { SomeoneRepliedToYourComment } from './notifications/SomeoneRepliedToYourComment';
import { SomeoneYouFollowPostedTheirFirstPost } from './notifications/SomeoneYouFollowPostedTheirFirstPost';
import YouReceivedTopActivityBadge from './notifications/YouReceivedTopActivityBadge';

type NotificationProps = {
  notificationRef: NotificationFragment$key;
  queryRef: NotificationQueryFragment$key;
  toggleSubView: (page?: JSX.Element) => void;
};

export function Notification({ notificationRef, queryRef, toggleSubView }: NotificationProps) {
  const notification = useFragment(
    graphql`
      fragment NotificationFragment on Notification {
        id
        seen

        __typename

        ... on SomeoneCommentedOnYourFeedEventNotification {
          feedEvent {
            dbid
          }
        }

        ... on SomeoneAdmiredYourFeedEventNotification {
          feedEvent {
            dbid
          }
        }

        ... on SomeoneViewedYourGalleryNotification {
          userViewers(last: 3) {
            pageInfo {
              total
            }
          }
        }

        ... on GroupedNotification {
          count
        }

        ... on SomeoneAdmiredYourPostNotification {
          post {
            dbid
          }
        }

        ... on SomeoneCommentedOnYourPostNotification {
          post {
            dbid
          }
        }

        ... on SomeoneAdmiredYourTokenNotification {
          token {
            dbid
          }
        }

        ... on SomeonePostedYourWorkNotification {
          post {
            dbid
          }
        }

        ... on SomeoneMentionedYouNotification {
          __typename
          mentionSource {
            __typename
            ... on Post {
              __typename
              dbid
            }
            ... on Comment {
              __typename
              dbid
              source {
                ... on Post {
                  __typename
                  dbid
                }
              }
            }
          }
        }

        ... on SomeoneMentionedYourCommunityNotification {
          __typename
          mentionSource {
            __typename
            ... on Post {
              __typename
              dbid
            }
            ... on Comment {
              __typename
              dbid
              source {
                ... on Post {
                  __typename
                  dbid
                }
              }
            }
          }
        }

        ... on NewTokensNotification {
          __typename
          count
          token {
            ... on Token {
              dbid
            }
          }
        }

        ... on SomeoneYouFollowPostedTheirFirstPostNotification {
          post {
            dbid
          }
        }

        ... on SomeoneRepliedToYourCommentNotification {
          __typename
          comment {
            dbid
            source {
              ... on Post {
                __typename
                dbid
              }
            }
          }
        }

        ... on GalleryAnnouncementNotification {
          __typename
          ctaLink
        }

        ... on SomeoneAdmiredYourCommentNotification {
          __typename
          dbid
          comment {
            dbid
            source {
              ... on Post {
                id
                dbid
              }
              ... on FeedEvent {
                id
                dbid
              }
            }
          }
        }

        ...NotificationInnerFragment
      }
    `,
    notificationRef
  );

  const query = useFragment(
    graphql`
      fragment NotificationQueryFragment on Query {
        ...NotificationInnerQueryFragment

        viewer {
          ... on Viewer {
            id
            user {
              username
              dbid
            }
          }
        }
      }
    `,
    queryRef
  );

  const { push } = useRouter();

  const clearAllNotifications = useClearNotifications();
  const { hideDrawer } = useDrawerActions();

  /**
   * Bear with me here, this `useMemo` returns a stable function
   * if we want that notification type to have a clickable action.
   *
   * If the notification should not be clickable, we return undefined
   * instead of a function. Signaling downstream that this notification
   * is not actionable.
   */
  type NotificationClick =
    | {
        handleClick: () => void;
        showCaret: boolean;
      }
    | undefined;

  const handleNotificationClick = useMemo((): NotificationClick => {
    function showUserListModal() {
      toggleSubView(
        <NotificationUserListPage notificationId={notification.id} toggleSubView={toggleSubView} />
      );
    }

    if (notification.feedEvent) {
      const username = query.viewer?.user?.username;
      const eventId = notification.feedEvent.dbid;

      return {
        showCaret: false,
        handleClick: function navigateToUserActivityWithFeedEventAtTop() {
          if (username && eventId) {
            push({ pathname: '/[username]/posts', query: { username, eventId } });
          }
          hideDrawer();
        },
      };
    } else if (notification.post) {
      const username = query.viewer?.user?.username;
      const postId = notification.post.dbid;

      return {
        showCaret: false,
        handleClick: function navigateToPostPage() {
          if (username && postId) {
            push({ pathname: '/post/[postId]', query: { postId } });
          }
          hideDrawer();
        },
      };
    } else if (
      notification.__typename === 'SomeoneAdmiredYourTokenNotification' &&
      notification.token
    ) {
      const username = query.viewer?.user?.username;
      const tokenId = notification.token.dbid;

      return {
        showCaret: false,
        handleClick: function navigateToNftDetailPage() {
          if (username && tokenId) {
            push({ pathname: '/[username]/token/[tokenId]', query: { username, tokenId } });
          }
          hideDrawer();
        },
      };
    } else if (notification.__typename === 'SomeoneViewedYourGalleryNotification') {
      const count = notification.userViewers?.pageInfo?.total ?? 0;

      if (count > 1) {
        return { handleClick: showUserListModal, showCaret: true };
      }

      return undefined;
    } else if (
      notification.__typename === 'GroupedNotification' &&
      Number(notification.count) > 1
    ) {
      return { showCaret: true, handleClick: showUserListModal };
    } else if (
      notification.__typename === 'SomeoneMentionedYouNotification' ||
      notification.__typename === 'SomeoneMentionedYourCommunityNotification'
    ) {
      const postId =
        notification.mentionSource?.__typename === 'Post'
          ? notification.mentionSource?.dbid
          : notification.mentionSource?.__typename === 'Comment' &&
            notification.mentionSource?.source?.__typename === 'Post'
          ? notification.mentionSource?.source?.dbid
          : undefined;

      const commentId =
        notification.mentionSource?.__typename === 'Comment' && notification.mentionSource?.dbid;

      return {
        showCaret: false,
        handleClick: function navigateToPostPage() {
          if (postId) {
            const query: { postId: string; commentId?: string } = { postId };
            if (commentId) {
              query.commentId = commentId;
            }
            push({ pathname: `/post/[postId]`, query });
          }
          hideDrawer();
        },
      };
    } else if (notification.__typename === 'SomeoneRepliedToYourCommentNotification') {
      const postId =
        notification.comment?.source?.__typename === 'Post'
          ? notification.comment?.source?.dbid
          : undefined;

      const commentId = notification.comment?.dbid;

      return {
        showCaret: false,
        handleClick: function navigateToPostPage() {
          if (postId) {
            push({ pathname: `/post/[postId]`, query: { postId, commentId } });
          }
          hideDrawer();
        },
      };
    } else if (notification.__typename === 'YouReceivedTopActivityBadgeNotification') {
      const username = query.viewer?.user?.username;

      return {
        showCaret: false,
        handleClick: function navigateToProfilePage() {
          if (username) {
            push({ pathname: '/[username]', query: { username } });
          }
          hideDrawer();
        },
      };
    } else if (notification.__typename === 'NewTokensNotification') {
      const username = query.viewer?.user?.username;
      const tokenId = notification.token?.dbid ?? '';
      return {
        showCaret: false,
        handleClick: function navigateToNftDetailPage() {
          if (username && tokenId) {
            push({ pathname: '/[username]/token/[tokenId]', query: { username, tokenId } });
          }
          hideDrawer();
        },
      };
    } else if (
      notification.__typename === 'GalleryAnnouncementNotification' &&
      notification.ctaLink
    ) {
      return {
        showCaret: false,
        handleClick: function navigateToGalleryAnnouncementLink() {
          if (!notification.ctaLink) return;
          window.open(notification.ctaLink, '_blank');
          hideDrawer();
        },
      };
    } else if (notification.__typename === 'SomeoneAdmiredYourCommentNotification') {
      const postId = notification.comment?.source?.dbid;

      return {
        showCaret: false,
        handleClick: function navigateToPostPage() {
          if (postId) {
            push({
              pathname: `/post/[postId]`,
              query: {
                postId,
                commentId: notification.comment?.dbid,
              },
            });
          }
          hideDrawer();
        },
      };
    }

    return undefined;
  }, [
    hideDrawer,
    notification,
    push,
    query.viewer?.user?.username,
    toggleSubView,
  ]);

  const isClickable = Boolean(handleNotificationClick);

  const track = useTrack();

  const handleClick = useCallback(() => {
    if (handleNotificationClick?.handleClick) {
      track('Notification Click', {
        id: 'Notification Row',
        variant: notification.__typename,
        context: contexts.Notifications,
      });
      handleNotificationClick.handleClick();
    }

    if (!query.viewer?.user?.dbid || !query.viewer.id) {
      return;
    }

    clearAllNotifications(query.viewer.user.dbid, [
      ConnectionHandler.getConnectionID(query.viewer.id, 'NotificationsFragment_notifications'),
      ConnectionHandler.getConnectionID(query.viewer.id, 'StandardSidebarFragment_notifications'),
    ]);
  }, [
    clearAllNotifications,
    handleNotificationClick,
    notification.__typename,
    query.viewer?.id,
    query.viewer?.user?.dbid,
    track,
  ]);

  if (
    ![
      'SomeoneAdmiredYourFeedEventNotification',
      'SomeoneCommentedOnYourFeedEventNotification',
      'SomeoneFollowedYouNotification',
      'SomeoneFollowedYouBackNotification',
      'SomeoneViewedYourGalleryNotification',
      'SomeoneAdmiredYourPostNotification',
      'SomeoneCommentedOnYourPostNotification',
      'SomeoneAdmiredYourTokenNotification',
      'NewTokensNotification',
      'SomeonePostedYourWorkNotification',
      'SomeoneMentionedYouNotification',
      'SomeoneMentionedYourCommunityNotification',
      'SomeoneYouFollowPostedTheirFirstPostNotification',
      'SomeoneRepliedToYourCommentNotification',
      'YouReceivedTopActivityBadgeNotification',
      'GalleryAnnouncementNotification',
      'SomeoneAdmiredYourCommentNotification',
    ].includes(notification.__typename)
  ) {
    return null;
  }

  // Leaving this commented in for now in case we regret this decision.
  // If the token is syncing or invalid -> we may still want them to post about it,
  // especially at the Marfa event. but this might litter the feed with wonky tokens.
  // On the flip side, if we don't show the notification, our system will feel like
  // it's slow.
  //
  // If the notification is a new token notification and the token is invalid, we don't want to show it
  // if (
  //   notification.__typename === 'NewTokensNotification' &&
  //   ['SyncingMedia', 'InvalidMedia'].includes(notification.token?.media?.__typename ?? '')
  // ) {
  //   return null;
  // }

  if (
    notification.__typename === 'SomeoneCommentedOnYourPostNotification' ||
    notification.__typename === 'SomeoneAdmiredYourPostNotification' ||
    notification.__typename === 'SomeonePostedYourWorkNotification' ||
    notification.__typename === 'SomeoneYouFollowPostedTheirFirstPostNotification'
  ) {
    if (!notification.post) {
      return null;
    }
  }

  return (
    <ReportingErrorBoundary fallback={null}>
      <Container
        isClickable={isClickable}
        onClick={handleClick}
        hasMultipleTokens={
          notification.__typename === 'NewTokensNotification' && Number(notification.count) > 1
        }
      >
        <HStack gap={8} align="center">
          {!notification.seen && (
            <StyledDotContainer align="center">
              <UnseenDot />
            </StyledDotContainer>
          )}
          <NotificationInner notificationRef={notification} queryRef={query} />
        </HStack>
      </Container>
    </ReportingErrorBoundary>
  );
}

const StyledDotContainer = styled(HStack)`
  width: 10px;
`;

type NotificationInnerProps = {
  notificationRef: NotificationInnerFragment$key;
  queryRef: NotificationInnerQueryFragment$key;
};

function NotificationInner({ notificationRef, queryRef }: NotificationInnerProps) {
  const notification = useFragment(
    graphql`
      fragment NotificationInnerFragment on Notification {
        ... on SomeoneFollowedYouNotification {
          __typename
          ...SomeoneFollowedYouFragment
        }

        ... on SomeoneFollowedYouBackNotification {
          __typename
          ...SomeoneFollowedYouBackFragment
        }

        ... on SomeoneAdmiredYourFeedEventNotification {
          __typename
          ...SomeoneAdmiredYourFeedEventFragment
        }

        ... on SomeoneCommentedOnYourFeedEventNotification {
          __typename
          ...SomeoneCommentedOnYourFeedEventFragment
        }

        ... on SomeoneViewedYourGalleryNotification {
          __typename
          ...SomeoneViewedYourGalleryFragment
        }

        ... on SomeoneAdmiredYourPostNotification {
          __typename
          ...SomeoneAdmiredYourPostFragment
        }

        ... on SomeoneCommentedOnYourPostNotification {
          __typename
          ...SomeoneCommentedOnYourPostFragment
        }

        ... on SomeoneAdmiredYourTokenNotification {
          __typename
          ...SomeoneAdmiredYourTokenFragment
        }

        ... on NewTokensNotification {
          __typename
          ...NewTokensFragment
        }

        ... on SomeonePostedYourWorkNotification {
          __typename
          ...SomeonePostedYourWorkFragment
        }

        ... on SomeoneMentionedYouNotification {
          __typename
          ...SomeoneMentionedYouFragment
        }

        ... on SomeoneMentionedYourCommunityNotification {
          __typename
          ...SomeoneMentionedYourCommunityFragment
        }

        ... on SomeoneYouFollowPostedTheirFirstPostNotification {
          __typename
          ...SomeoneYouFollowPostedTheirFirstPostFragment
        }

        ... on SomeoneRepliedToYourCommentNotification {
          __typename
          ...SomeoneRepliedToYourCommentFragment
        }

        ... on YouReceivedTopActivityBadgeNotification {
          __typename
        }

        ... on GalleryAnnouncementNotification {
          __typename
          platform
          ...GalleryAnnouncementFragment
        }

        ... on SomeoneAdmiredYourCommentNotification {
          __typename
          ...SomeoneAdmiredYourCommentFragment
        }
      }
    `,
    notificationRef
  );

  const query = useFragment(
    graphql`
      fragment NotificationInnerQueryFragment on Query {
        ...SomeoneFollowedYouQueryFragment
        ...SomeoneCommentedOnYourPostQueryFragment
        ...SomeoneRepliedToYourCommentQueryFragment
      }
    `,
    queryRef
  );

  const { hideDrawer } = useDrawerActions();
  const handleClose = useCallback(() => {
    hideDrawer();
  }, [hideDrawer]);

  if (notification.__typename === 'SomeoneAdmiredYourFeedEventNotification') {
    return <SomeoneAdmiredYourFeedEvent notificationRef={notification} onClose={handleClose} />;
  } else if (notification.__typename === 'SomeoneViewedYourGalleryNotification') {
    return <SomeoneViewedYourGallery notificationRef={notification} onClose={handleClose} />;
  } else if (notification.__typename === 'SomeoneFollowedYouNotification') {
    return (
      <SomeoneFollowedYou notificationRef={notification} queryRef={query} onClose={handleClose} />
    );
  } else if (notification.__typename === 'SomeoneFollowedYouBackNotification') {
    return <SomeoneFollowedYouBack notificationRef={notification} onClose={handleClose} />;
  } else if (notification.__typename === 'SomeoneCommentedOnYourFeedEventNotification') {
    return <SomeoneCommentedOnYourFeedEvent notificationRef={notification} onClose={handleClose} />;
  } else if (notification.__typename === 'SomeoneAdmiredYourPostNotification') {
    return <SomeoneAdmiredYourPost notificationRef={notification} onClose={handleClose} />;
  } else if (notification.__typename === 'SomeoneCommentedOnYourPostNotification') {
    return (
      <SomeoneCommentedOnYourPost
        notificationRef={notification}
        queryRef={query}
        onClose={handleClose}
      />
    );
  } else if (notification.__typename === 'SomeoneAdmiredYourTokenNotification') {
    return <SomeoneAdmiredYourToken notificationRef={notification} onClose={handleClose} />;
  } else if (notification.__typename === 'NewTokensNotification') {
    return <NewTokens notificationRef={notification} onClose={handleClose} />;
  } else if (notification.__typename === 'SomeonePostedYourWorkNotification') {
    return <SomeonePostedYourWork notificationRef={notification} onClose={handleClose} />;
  } else if (notification.__typename === 'SomeoneMentionedYouNotification') {
    return <SomeoneMentionedYou notificationRef={notification} onClose={handleClose} />;
  } else if (notification.__typename === 'SomeoneMentionedYourCommunityNotification') {
    return <SomeoneMentionedYourCommunity notificationRef={notification} onClose={handleClose} />;
  } else if (notification.__typename === 'SomeoneYouFollowPostedTheirFirstPostNotification') {
    return (
      <SomeoneYouFollowPostedTheirFirstPost notificationRef={notification} onClose={handleClose} />
    );
  } else if (notification.__typename === 'SomeoneRepliedToYourCommentNotification') {
    return (
      <SomeoneRepliedToYourComment
        notificationRef={notification}
        queryRef={query}
        onClose={handleClose}
      />
    );
  } else if (notification.__typename === 'YouReceivedTopActivityBadgeNotification') {
    return <YouReceivedTopActivityBadge />;
  } else if (
    notification.__typename === 'GalleryAnnouncementNotification' &&
    notification.platform !== 'Mobile'
  ) {
    return <GalleryAnnouncement notificationRef={notification} onClose={handleClose} />;
  } else if (notification.__typename === 'SomeoneAdmiredYourCommentNotification') {
    return <SomeoneAdmiredYourComment notificationRef={notification} onClose={handleClose} />;
  }

  return null;
}

const UnseenDot = styled.div`
  width: 8px;
  height: 8px;

  background-color: ${colors.hyperBlue};
  border-radius: 9999px;
`;

const Container = styled.div<{ isClickable: boolean; hasMultipleTokens: boolean }>`
  padding: 16px;

  ${({ isClickable }) =>
    isClickable
      ? css`
          cursor: pointer;
          :hover {
            background-color: ${colors.faint};
          }
        `
      : css``};
  ${({ hasMultipleTokens }) =>
    hasMultipleTokens
      ? `
      :hover ${StyledPostPreview} {
        border: 1px solid ${colors.faint};
      }
    `
      : ''}
`;
