import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';
import { AutoSizer, InfiniteLoader, List, ListRowRenderer } from 'react-virtualized';
import { SelectorStoreUpdater } from 'relay-runtime';
import styled from 'styled-components';

import { USER_PER_PAGE } from '~/constants/twitter';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { TwitterFollowingModalFragment$key } from '~/generated/TwitterFollowingModalFragment.graphql';
import { TwitterFollowingModalMutation } from '~/generated/TwitterFollowingModalMutation.graphql';
import { TwitterFollowingModalQueryFragment$key } from '~/generated/TwitterFollowingModalQueryFragment.graphql';
import { contexts, flows } from '~/shared/analytics/constants';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

import breakpoints from '../core/breakpoints';
import { Button } from '../core/Button/Button';
import InteractiveLink from '../core/InteractiveLink/InteractiveLink';
import Markdown from '../core/Markdown/Markdown';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, TitleDiatypeL } from '../core/Text/Text';
import FollowButton from '../Follow/FollowButton';

type Props = {
  followingRef: TwitterFollowingModalFragment$key;
  queryRef: TwitterFollowingModalQueryFragment$key;
};

export default function TwitterFollowingModal({ followingRef, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment TwitterFollowingModalQueryFragment on Query {
        ...FollowButtonQueryFragment

        viewer {
          ... on Viewer {
            user {
              id
              following {
                id
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const {
    data: followingPagination,
    loadNext,
    hasNext,
  } = usePaginationFragment(
    graphql`
      fragment TwitterFollowingModalFragment on Query
      @refetchable(queryName: "TwitterFollowingModalQuery") {
        socialConnections(
          after: $twitterListAfter
          first: $twitterListFirst
          socialAccountType: Twitter
          excludeAlreadyFollowing: false
        ) @connection(key: "TwitterFollowingModal__socialConnections") {
          edges {
            node {
              __typename
              ... on SocialConnection {
                __typename
                galleryUser {
                  ... on GalleryUser {
                    id
                    username
                    bio
                    ...FollowButtonUserFragment
                  }
                }
              }
            }
          }
          pageInfo {
            total
          }
        }
      }
    `,
    followingRef
  );

  const { hideModal } = useModalActions();

  const handleClose = useCallback(() => {
    hideModal();
  }, [hideModal]);

  const twitterFollowing = useMemo(() => {
    const users = [];

    for (const edge of followingPagination?.socialConnections?.edges ?? []) {
      if (edge?.node?.__typename === 'SocialConnection' && edge?.node?.galleryUser) {
        users.push(edge?.node.galleryUser);
      }
    }

    return users;
  }, [followingPagination]);

  const [followAll] = usePromisifiedMutation<TwitterFollowingModalMutation>(graphql`
    mutation TwitterFollowingModalMutation {
      followAllSocialConnections(accountType: Twitter) {
        __typename
        ... on FollowAllSocialConnectionsPayload {
          __typename
          viewer {
            ... on Viewer {
              __typename
              user @required(action: THROW) {
                __typename
                id
                dbid
                following {
                  id
                }
              }
            }
          }
        }
      }
    }
  `);
  const reportError = useReportError();
  const { pushToast } = useToastActions();

  const totalFollowing = followingPagination?.socialConnections?.pageInfo?.total ?? 0;

  const [isMutationLoading, setIsMutationLoading] = useState(false);

  const handleFollowAll = useCallback(async () => {
    setIsMutationLoading(true);
    try {
      const updater: SelectorStoreUpdater<TwitterFollowingModalMutation['response']> = (
        store,
        response
      ) => {
        const followingUserIds = twitterFollowing.map((user) => user.id);

        if (
          response.followAllSocialConnections?.__typename === 'FollowAllSocialConnectionsPayload'
        ) {
          const currentId = query?.viewer?.user?.id;
          if (!currentId) {
            return;
          }

          const currentUserId = store.get(currentId);
          if (!currentUserId) {
            return;
          }

          for (const userId of followingUserIds) {
            const user = store.get(userId);
            const followers = user?.getLinkedRecords('followers');

            if (followers) {
              user?.setLinkedRecords([...followers, currentUserId], 'followers');
            }
          }
        }
      };

      await followAll({
        variables: {},
        updater,
      });
    } catch (error) {
      if (error instanceof Error) {
        reportError(error);
        pushToast({
          message: 'Unfortunately there was an error while following all users',
        });
      }
    } finally {
      setIsMutationLoading(false);
    }
  }, [followAll, pushToast, query?.viewer?.user?.id, reportError, twitterFollowing]);

  const isRowLoaded = ({ index }: { index: number }) => !hasNext || index < twitterFollowing.length;

  const handleLoadMore = useCallback(async () => {
    loadNext(USER_PER_PAGE);
  }, [loadNext]);

  const rowCount = hasNext ? twitterFollowing.length + 1 : twitterFollowing.length;

  const rowRenderer = useCallback<ListRowRenderer>(
    ({ index, key, style }: { index: number; key: string; style: React.CSSProperties }) => {
      const user = twitterFollowing[index];

      if (!user) {
        return null;
      }

      return (
        <StyledFollowing align="center" justify="space-between" style={style} key={key} gap={4}>
          <VStack>
            <InteractiveLink
              to={{
                pathname: '/[username]',
                query: {
                  username: user.username as string,
                },
              }}
            >
              <BaseM>
                <strong>{user.username}</strong>
              </BaseM>
            </InteractiveLink>
            <BioText>
              <Markdown text={user.bio ?? ''} />
            </BioText>
          </VStack>
          <FollowButton queryRef={query} userRef={user} />
        </StyledFollowing>
      );
    },
    [query, twitterFollowing]
  );

  // a non-ideal way to calculate this value but for now we can't easily
  // grab whether the logged in user is already following another user
  const isFollowingEveryone = useMemo(() => {
    const followingList = new Set(
      (query.viewer?.user?.following ?? []).map((following: { id: string } | null) => following?.id)
    );
    for (const suggestedUser of twitterFollowing) {
      if (!followingList.has(suggestedUser.id)) {
        return false;
      }
    }
    return true;
  }, [query.viewer?.user?.following, twitterFollowing]);

  return (
    <StyledOnboardingTwitterModal>
      <StyledBodyTextContainer>
        <TitleDiatypeL>
          We've found {totalFollowing}
          {totalFollowing === 1 ? ' person' : ' people'} you know from Twitter
        </TitleDiatypeL>
      </StyledBodyTextContainer>

      <StyledFollowingContainer gap={16}>
        <AutoSizer>
          {({ width, height }) => (
            <InfiniteLoader
              isRowLoaded={isRowLoaded}
              loadMoreRows={handleLoadMore}
              rowCount={rowCount}
            >
              {({ onRowsRendered, registerChild }) => (
                <List
                  ref={registerChild}
                  onRowsRendered={onRowsRendered}
                  rowRenderer={rowRenderer}
                  width={width}
                  height={height}
                  rowHeight={50}
                  rowCount={twitterFollowing.length}
                />
              )}
            </InfiniteLoader>
          )}
        </AutoSizer>
        <VStack></VStack>
      </StyledFollowingContainer>

      <HStack justify="flex-end" gap={10}>
        <StyledButtonSkip
          eventElementId="Skip Twitter Follow All Button"
          eventName="Skip Twitter Follow All"
          eventContext={contexts['External Social']}
          eventFlow={flows.Twitter}
          onClick={handleClose}
          variant="secondary"
        >
          SKIP
        </StyledButtonSkip>
        <StyledButtonFollowAll
          eventElementId="Twitter Follow All Button"
          eventName="Twitter Follow All"
          eventContext={contexts['External Social']}
          eventFlow={flows.Twitter}
          onClick={handleFollowAll}
          variant="primary"
          disabled={isFollowingEveryone}
          pending={isMutationLoading}
        >
          FOLLOW ALL
        </StyledButtonFollowAll>
      </HStack>
    </StyledOnboardingTwitterModal>
  );
}

const StyledOnboardingTwitterModal = styled.div`
  width: 100%;

  @media only screen and ${breakpoints.tablet} {
    width: 375px;
  }
`;

const StyledBodyTextContainer = styled.div`
  padding: 48px 0 16px;
`;

const StyledFollowingContainer = styled(VStack)`
  padding: 16px 0;

  width: 375px;
  max-width: 375px;
  min-height: 100px;
  height: 400px;
`;

const StyledFollowing = styled(HStack)`
  padding-right: 8px;
`;

const BioText = styled(BaseM)`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;

  p {
    padding-bottom: 0;
  }
`;

const StyledButtonSkip = styled(Button)`
  width: 59px;
`;

const StyledButtonFollowAll = styled(Button)`
  padding: 8px 16px;
`;
