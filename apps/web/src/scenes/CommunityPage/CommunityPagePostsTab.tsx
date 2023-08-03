import { useCallback, useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseXL } from '~/components/core/Text/Text';
import { ITEMS_PER_PAGE } from '~/components/Feed/constants';
import FeedList from '~/components/Feed/FeedList';
import { PostComposerModalWithSelector } from '~/components/Posts/PostComposerModal';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { CommunityPagePostsTabFragment$key } from '~/generated/CommunityPagePostsTabFragment.graphql';
import { CommunityPagePostsTabQueryFragment$key } from '~/generated/CommunityPagePostsTabQueryFragment.graphql';
import { PostComposerModalWithSelectorFragment$key } from '~/generated/PostComposerModalWithSelectorFragment.graphql';
import { RefetchableCommunityFeedQuery } from '~/generated/RefetchableCommunityFeedQuery.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type Props = {
  communityRef: CommunityPagePostsTabFragment$key;
  queryRef: CommunityPagePostsTabQueryFragment$key;
};

export default function CommunityPagePostsTab({ communityRef, queryRef }: Props) {
  const {
    data: community,
    loadPrevious,
    hasPrevious,
  } = usePaginationFragment<RefetchableCommunityFeedQuery, CommunityPagePostsTabFragment$key>(
    graphql`
      fragment CommunityPagePostsTabFragment on Community
      @refetchable(queryName: "RefetchableCommunityFeedQuery") {
        posts(before: $communityPostsBefore, last: $communityPostsLast)
          @connection(key: "CommunityFeed_posts") {
          edges {
            node {
              ... on Post {
                __typename
                ...FeedListEventDataFragment
              }
            }
          }
        }
        name
        contractAddress {
          address
        }
      }
    `,
    communityRef
  );

  const feedData = useMemo(() => {
    const events = [];

    for (const edge of community.posts?.edges ?? []) {
      if (edge?.node?.__typename === 'Post' && edge.node) {
        events.push(edge.node);
      }
    }

    return events;
  }, [community.posts?.edges]);

  const query = useFragment(
    graphql`
      fragment CommunityPagePostsTabQueryFragment on Query {
        viewer {
          ... on Viewer {
            __typename
            user {
              tokens {
                ...PostComposerModalWithSelectorFragment
              }
            }
          }
        }
        ...FeedListFragment
        ...PostComposerModalWithSelectorQueryFragment
      }
    `,
    queryRef
  );

  const loadNextPage = useCallback(() => {
    return new Promise((resolve) => {
      // Infinite scroll component wants load callback to return a promise
      loadPrevious(ITEMS_PER_PAGE, { onComplete: () => resolve('loaded') });
    });
  }, [loadPrevious]);

  const { showModal } = useModalActions();
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const tokens = useMemo<PostComposerModalWithSelectorFragment$key>(() => {
    if (query?.viewer?.__typename !== 'Viewer') {
      return [];
    }
    return removeNullValues(query?.viewer?.user?.tokens) ?? [];
  }, [query?.viewer]);

  const handleCreatePostClick = useCallback(() => {
    showModal({
      content: (
        <PostComposerModalWithSelector
          tokensRef={tokens}
          queryRef={query}
          preSelectedContract={{
            title: community.name ?? '',
            address: community.contractAddress?.address ?? '', // ok to proceed to post composer even if contractAddress is missing (unlikely). user will just be prompted to select a token
          }}
        />
      ),
      headerVariant: 'thicc',
      isFullPage: isMobile,
    });
  }, [showModal, tokens, query, community.name, community.contractAddress?.address, isMobile]);

  // KAITO TODO (follow up): set to false if user is not member of community , blocked by backend
  const viewerIsCommunityOwner = false;

  if (!feedData || feedData.length === 0) {
    return (
      <StyledEmptyState>
        {viewerIsCommunityOwner ? (
          <StyledFirstPostCta gap={32} align="center">
            <BaseXL>
              It's still early... be the first to post about{' '}
              {community.name ? <strong>{community.name}</strong> : 'this community'} and inspire
              others!
            </BaseXL>
            <StyledButton onClick={handleCreatePostClick}>Create a Post</StyledButton>
          </StyledFirstPostCta>
        ) : (
          <BaseXL>
            No one has posted about{' '}
            {community.name ? <strong>{community.name}</strong> : 'this community'} yet
          </BaseXL>
        )}
      </StyledEmptyState>
    );
  }

  return (
    <FeedList
      feedEventRefs={feedData}
      queryRef={query}
      loadNextPage={loadNextPage}
      hasNext={hasPrevious}
    />
  );
}

const StyledEmptyState = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding-top: 100px;
  text-align: center;
`;

const StyledFirstPostCta = styled(VStack)`
  width: 320px;
`;

const StyledButton = styled(Button)`
  width: 140px;
`;
