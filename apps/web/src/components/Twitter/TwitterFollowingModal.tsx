import { useVirtualizer } from '@tanstack/react-virtual';
import Link, { LinkProps } from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';
import styled from 'styled-components';

import { USER_PER_PAGE } from '~/constants/twitter';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { TwitterFollowingModalFragment$key } from '~/generated/TwitterFollowingModalFragment.graphql';
import { TwitterFollowingModalMutation } from '~/generated/TwitterFollowingModalMutation.graphql';
import { TwitterFollowingModalQueryFragment$key } from '~/generated/TwitterFollowingModalQueryFragment.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';

import breakpoints from '../core/breakpoints';
import { Button } from '../core/Button/Button';
import Markdown from '../core/Markdown/Markdown';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, TitleDiatypeL } from '../core/Text/Text';
import FollowButton from '../Follow/FollowButton';
import VirtualizeContainer from '../Virtualize/VirtualizeContainer';

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

  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: twitterFollowing.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

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

  const handleFollowAll = useCallback(async () => {
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
    }
  }, [followAll, pushToast, query?.viewer?.user?.id, reportError, twitterFollowing]);

  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const handleLoadMore = useCallback(async () => {
    setIsFetchingNextPage(true);
    loadNext(USER_PER_PAGE);
    setIsFetchingNextPage(false);
  }, [loadNext]);

  useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (lastItem.index >= twitterFollowing.length - 1 && hasNext && !isFetchingNextPage) {
      handleLoadMore();
    }
  }, [handleLoadMore, hasNext, isFetchingNextPage, twitterFollowing.length, virtualizer]);

  return (
    <StyledOnboardingTwitterModal>
      <StyledBodyTextContainer>
        <TitleDiatypeL>
          We've found {totalFollowing}
          {totalFollowing === 1 ? ' person' : ' people'} you know from Twitter
        </TitleDiatypeL>
      </StyledBodyTextContainer>

      <StyledFollowingContainer gap={16}>
        <VirtualizeContainer virtualizer={virtualizer} ref={parentRef}>
          {virtualItems.map((item) => {
            const user = twitterFollowing[item.index];

            if (!user) {
              return null;
            }

            return (
              <StyledFollowing
                align="center"
                justify="space-between"
                gap={4}
                data-index={item.index}
                ref={virtualizer.measureElement}
                key={item.key}
              >
                <VStack>
                  <StyledLink
                    href={{
                      pathname: '/[username]',
                      query: {
                        username: user.username as string,
                      },
                    }}
                  >
                    <BaseM>
                      <strong>{user.username}</strong>
                    </BaseM>
                  </StyledLink>
                  <BioText>
                    <Markdown text={user.bio ?? ''} />
                  </BioText>
                </VStack>
                <FollowButton queryRef={query} userRef={user} />
              </StyledFollowing>
            );
          })}
        </VirtualizeContainer>
        {/* <VStack></VStack> */}
      </StyledFollowingContainer>

      <HStack justify="flex-end" gap={10}>
        <StyledButtonSkip onClick={handleClose} variant="secondary">
          SKIP
        </StyledButtonSkip>
        <StyledButtonFollowAll onClick={handleFollowAll} variant="primary">
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
  overflow-y: auto;
`;

const StyledFollowing = styled(HStack)`
  padding: 8px 8px 8px 0;
`;

const StyledLink = styled(Link)<LinkProps>`
  text-decoration: none;
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
