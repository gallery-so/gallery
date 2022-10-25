import breakpoints from 'components/core/breakpoints';
import Loader from 'components/core/Loader/Loader';
import { VStack } from 'components/core/Spacer/Stack';
import { TitleS } from 'components/core/Text/Text';
import { GRID_ITEM_PER_PAGE } from 'constants/community';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';
import { CommunityHolderGridFragment$key } from '__generated__/CommunityHolderGridFragment.graphql';
import CommunityHolderGridItem from './CommunityHolderGridItem';

type Props = {
  communityRef: CommunityHolderGridFragment$key;
};

export default function CommunityHolderGrid({ communityRef }: Props) {
  const { data: community, loadNext, hasNext } = usePaginationFragment(
    graphql`
      fragment CommunityHolderGridFragment on Community
        @refetchable(queryName: "CommunityHolderRefetchableFragment") {
        id

        tokensInCommunity(first: $tokenCommunityFirst, after: $tokenCommunityAfter)
          @connection(key: "CommunityPageView_tokensInCommunity") {
          edges {
            node {
              __typename

              media {
                __typename
              }
              owner {
                username
              }
              ...CommunityHolderGridItemFragment
            }
          }
        }
      }
    `,
    communityRef
  );

  const [isFetching, setIsFetching] = useState(false);

  const tokenHolders = useMemo(() => {
    const tokens = [];

    for (const token of community.tokensInCommunity?.edges ?? []) {
      if (token?.node) {
        tokens.push(token.node);
      }
    }

    return tokens;
  }, [community.tokensInCommunity?.edges]);

  const filteredTokens = useMemo(() => {
    return tokenHolders.filter((token) => token?.media?.__typename !== 'InvalidMedia');
  }, [tokenHolders]);

  const nonGalleryMemberTokens = useMemo(() => {
    return filteredTokens.filter((token) => !token?.owner);
  }, [filteredTokens]);

  const galleryMemberTokens = useMemo(() => {
    return filteredTokens.filter((token) => token?.owner);
  }, [filteredTokens]);

  const handleSeeMore = useCallback(() => {
    setIsFetching(true);
    loadNext(GRID_ITEM_PER_PAGE, {
      onComplete: () => {
        setIsFetching(false);
      },
    });
  }, [loadNext]);

  useEffect(() => {
    function handleScrollPosition() {
      const pixelsFromBottomOfPage =
        document.body.offsetHeight - window.pageYOffset - window.innerHeight;
      if (pixelsFromBottomOfPage < 80 && hasNext && !isFetching) {
        handleSeeMore();
      }
    }

    window.addEventListener('scroll', handleScrollPosition);

    return () => window.removeEventListener('scroll', handleScrollPosition);
  }, [handleSeeMore, hasNext, isFetching]);

  return (
    <VStack gap={48}>
      <VStack gap={16}>
        <TitleS>Gallery members</TitleS>
        <StyledCommunityHolderGrid>
          {galleryMemberTokens.map((holder) =>
            holder ? <CommunityHolderGridItem holderRef={holder} /> : null
          )}
        </StyledCommunityHolderGrid>
      </VStack>
      {nonGalleryMemberTokens.length > 0 && (
        <VStack gap={16}>
          <TitleS>Other members</TitleS>

          <StyledCommunityHolderGrid>
            {nonGalleryMemberTokens.map((holder) =>
              holder ? <CommunityHolderGridItem holderRef={holder} /> : null
            )}
          </StyledCommunityHolderGrid>
        </VStack>
      )}

      {isFetching && (
        <VStack align="center" justify="center">
          <Loader inverted size="small" />
        </VStack>
      )}
    </VStack>
  );
}

const StyledCommunityHolderGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-gap: 24px;

  @media only screen and ${breakpoints.tablet} {
    grid-template-columns: repeat(4, 1fr);
  }
`;
