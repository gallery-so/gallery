import breakpoints from 'components/core/breakpoints';
import { VStack } from 'components/core/Spacer/Stack';
import { TitleS } from 'components/core/Text/Text';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { CommunityHolderGridFragment$key } from '__generated__/CommunityHolderGridFragment.graphql';
import CommunityHolderGridItem from './CommunityHolderGridItem';

type Props = {
  communityRef: CommunityHolderGridFragment$key;
};

export default function CommunityHolderGrid({ communityRef }: Props) {
  const tokenHolders = useFragment(
    graphql`
      fragment CommunityHolderGridFragment on Token @relay(plural: true) {
        media {
          __typename
        }
        owner {
          username
        }
        ...CommunityHolderGridItemFragment
      }
    `,
    communityRef
  );

  const filteredTokens = useMemo(() => {
    return tokenHolders.filter((token) => token?.media?.__typename !== 'InvalidMedia');
  }, [tokenHolders]);

  const nonGalleryMemberTokens = useMemo(() => {
    return filteredTokens.filter((token) => !token?.owner);
  }, [filteredTokens]);

  const galleryMemberTokens = useMemo(() => {
    return filteredTokens.filter((token) => token?.owner);
  }, [filteredTokens]);

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
