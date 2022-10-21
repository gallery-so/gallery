import breakpoints from 'components/core/breakpoints';
import { VStack } from 'components/core/Spacer/Stack';
import { TitleS } from 'components/core/Text/Text';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { CommunityHolderGridFragment$key } from '__generated__/CommunityHolderGridFragment.graphql';
import CommunityHolderGridItem from './CommunityHolderGridItem';
import { useMemo } from 'react';

type Props = {
  communityRef: CommunityHolderGridFragment$key;
};

export default function CommunityHolderGrid({ communityRef }: Props) {
  const tokenHolders = useFragment(
    graphql`
      fragment CommunityHolderGridFragment on Token @relay(plural: true) {
        ...CommunityHolderGridItemFragment
      }
    `,
    communityRef
  );

  const totalHolders = tokenHolders.length;

  return (
    <VStack gap={16}>
      <TitleS>Gallery members ({totalHolders})</TitleS>

      <StyledCommunityHolderGrid>
        {tokenHolders.map((holder) =>
          holder ? <CommunityHolderGridItem holderRef={holder} /> : null
        )}
      </StyledCommunityHolderGrid>
    </VStack>
  );
}

const StyledCommunityHolderGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-gap: 24px;

  @media only screen and ${breakpoints.tablet} {
    grid-template-columns: repeat(3, 1fr);
  }
`;
