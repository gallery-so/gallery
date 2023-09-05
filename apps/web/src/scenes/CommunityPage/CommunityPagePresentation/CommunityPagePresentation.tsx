import GalleryLogoNoBrackets from 'public/icons/gallery_logo_no_brackets.svg';
import ProhibitionLogo from 'public/icons/prohibition_logo.svg';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleCondensed, TitleM } from '~/components/core/Text/Text';
import { ITEMS_PER_PAGE } from '~/components/Feed/constants';
import { CommunityPagePresentationFragment$key } from '~/generated/CommunityPagePresentationFragment.graphql';
import { RefetchableCommunityPresentationFeedQuery } from '~/generated/RefetchableCommunityPresentationFeedQuery.graphql';
import useWindowSize from '~/hooks/useWindowSize';
import CloseIcon from '~/icons/CloseIcon';
import LogoBracketLeft from '~/icons/LogoBracketLeft';
import LogoBracketRight from '~/icons/LogoBracketRight';

import CommunityPagePostCycle from '../CommunityPagePostCycle';

type Props = {
  communityRef: CommunityPagePresentationFragment$key;
  queryRef: CommunityPagePresentationFragment$key;
};

export default function CommunityPagePresentation({ communityRef, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CommunityPagePresentationQueryFragment on Query {
        viewer {
          ... on Viewer {
            __typename
          }
        }
        ...CommunityPagePostCycleQueryFragment
      }
    `,
    queryRef
  );

  // currently getting data from new to old, we want old to
  // need to get data

  const {
    data: community,
    loadNext,
    hasPrevious,
  } = usePaginationFragment<
    RefetchableCommunityPresentationFeedQuery,
    CommunityPagePresentationFragment$key
  >(
    graphql`
      fragment CommunityPagePresentationFragment on Community
      @refetchable(queryName: "RefetchableCommunityPresentationFeedQuery") {
        presentationPosts: posts(after: $communityPostsAfter, first: $communityPostsFirst)
          @connection(key: "CommunityFeed_presentationPosts") {
          edges {
            node {
              ... on Post {
                __typename
                # ...FeedListEventDataFragment
                ...CommunityPagePostCycleFragment
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

  const postData = useMemo(() => {
    const events = [];

    for (const edge of community.presentationPosts?.edges ?? []) {
      if (edge?.node?.__typename === 'Post' && edge.node) {
        events.push(edge.node);
      }
    }

    return events;
  }, [community.presentationPosts?.edges]);

  // const community = useFragment(
  //   graphql`
  //     fragment CommunityPagePresentationFragment on Community {
  //       __typename
  //     }
  //   `,
  //   communityRef
  // );

  const loadNextPage = useCallback(() => {
    return new Promise((resolve) => {
      // Infinite scroll component wants load callback to return a promise
      loadNext(ITEMS_PER_PAGE, { onComplete: () => resolve('loaded') });
    });
  }, [loadNext]);

  const { width } = useWindowSize();

  // width of a post + padding 512 + 16*2
  const scale = width / 544;

  return (
    <StyledPresentation>
      <VStack align="center" gap={54}>
        <HStack gap={28} align="center">
          <GalleryLogoNoBrackets />
          <CloseIcon size={35} />
          <ProhibitionLogo />
        </HStack>
        <HStack align="center" gap={94}>
          <LogoBracketLeft width={75} height={252} />
          <StyledArtistName>Jimena Buena Vida</StyledArtistName>
          <LogoBracketRight width={75} height={252} />
        </HStack>
      </VStack>
      {postData.length === 0 ? (
        <StyledEmptyState justify="center" gap={84}>
          <StyledEmptyStateText>Mint to join the conversation</StyledEmptyStateText>
          <StyledEmptyStateText>[ insert QR code ]</StyledEmptyStateText>
        </StyledEmptyState>
      ) : (
        <StyledPostsContainer scale={scale}>
          <CommunityPagePostCycle
            postRefs={postData}
            queryRef={query}
            loadNextPage={loadNextPage}
            hasNext={hasPrevious}
          />
        </StyledPostsContainer>
      )}
    </StyledPresentation>
  );
}

const StyledPresentation = styled(VStack)`
  padding: 80px 0;
  height: 100%;
`;

const StyledPostsContainer = styled.div<{ scale: number }>`
  transform: scale(${({ scale }) => scale});
  transform-origin: top center;
`;

const StyledEmptyState = styled(VStack)`
  height: 100%;
`;
const StyledEmptyStateText = styled(TitleCondensed)`
  font-size: 120px;
  line-height: 120px;
`;

const StyledArtistName = styled(TitleM)`
  // font-family: 'GT Alpina', serif;
  font-size: 200px;
  line-height: 190px;
  letter-spacing: -0.03em;
`;
