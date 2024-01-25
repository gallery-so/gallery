import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import Loader from '~/components/core/Loader/Loader';
import { VStack } from '~/components/core/Spacer/Stack';
import { GRID_ITEM_PER_PAGE } from '~/constants/community';
import { GLOBAL_FOOTER_HEIGHT } from '~/contexts/globalLayout/GlobalFooter/GlobalFooter';
import { CommunityHolderGridFragment$key } from '~/generated/CommunityHolderGridFragment.graphql';
import { CommunityHolderGridQueryFragment$key } from '~/generated/CommunityHolderGridQueryFragment.graphql';

import CommunityHolderGridItem from './CommunityHolderGridItem';

type Props = {
  communityRef: CommunityHolderGridFragment$key;
  queryRef: CommunityHolderGridQueryFragment$key;
};

export default function CommunityHolderGrid({ communityRef, queryRef }: Props) {
  const {
    data: community,
    loadNext,
    hasNext,
  } = usePaginationFragment(
    graphql`
      fragment CommunityHolderGridFragment on Community
      @refetchable(queryName: "CommunityHolderRefetchableFragment") {
        id

        tokens(first: $tokenCommunityFirst, after: $tokenCommunityAfter)
          @connection(key: "CommunityPageView_tokens") {
          edges {
            node {
              __typename
              id
              definition {
                media {
                  __typename
                }
              }
              ...CommunityHolderGridItemFragment
            }
          }
        }
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityHolderGridQueryFragment on Query {
        ...CommunityHolderGridItemQueryFragment
      }
    `,
    queryRef
  );

  const [isFetching, setIsFetching] = useState(false);

  const tokenHolders = useMemo(() => {
    const tokens = [];

    for (const token of community.tokens?.edges ?? []) {
      if (token?.node) {
        tokens.push(token.node);
      }
    }

    return tokens;
  }, [community.tokens?.edges]);

  const filteredTokens = useMemo(() => {
    return tokenHolders.filter((token) => token?.definition?.media?.__typename !== 'InvalidMedia');
  }, [tokenHolders]);

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
      if (pixelsFromBottomOfPage < GLOBAL_FOOTER_HEIGHT && hasNext && !isFetching) {
        handleSeeMore();
      }
    }

    window.addEventListener('scroll', handleScrollPosition);

    return () => window.removeEventListener('scroll', handleScrollPosition);
  }, [handleSeeMore, hasNext, isFetching]);

  return (
    <VStack gap={48}>
      {filteredTokens.length > 0 && (
        <VStack gap={16}>
          <StyledCommunityHolderGrid>
            {filteredTokens.map((holder) =>
              holder ? (
                <CommunityHolderGridItem key={holder.id} holderRef={holder} queryRef={query} />
              ) : null
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

  @media only screen and ${breakpoints.mobile} {
    grid-template-columns: repeat(2, 1fr);
  }
`;
