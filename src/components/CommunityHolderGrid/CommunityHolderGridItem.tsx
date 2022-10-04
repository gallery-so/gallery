import { BaseM } from 'components/core/Text/Text';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { CommunityHolderGridItemFragment$key } from '__generated__/CommunityHolderGridItemFragment.graphql';

type Props = {
  holderRef: CommunityHolderGridItemFragment$key;
};

export default function CommunityHolderGridItem({ holderRef }: Props) {
  const holder = useFragment(
    graphql`
      fragment CommunityHolderGridItemFragment on TokenHolder {
        displayName
        user @required(action: THROW) {
          dbid
          username @required(action: THROW)
        }
        previewTokens
      }
    `,
    holderRef
  );

  const firstImage = holder?.previewTokens ? holder?.previewTokens[0] : null;

  return (
    <StyledCommunityHolderGridItemContainer>
      {firstImage && <StyledNftImage src={firstImage} />}
      <BaseM>{holder?.displayName}</BaseM>
    </StyledCommunityHolderGridItemContainer>
  );
}

const StyledCommunityHolderGridItemContainer = styled.div``;

const StyledNftImage = styled.img`
  min-height: 240px;
  width: auto;
  max-width: 100%;
`;
