import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { VStack } from 'components/core/Spacer/Stack';
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

  const galleryLink = `/${holder?.user?.username}`;

  return (
    <VStack gap={8}>
      {firstImage && <StyledNftImage src={firstImage} />}
      <VStack>
        <BaseM>Untitled</BaseM>
        <InteractiveLink to={galleryLink}>{holder?.displayName}</InteractiveLink>
      </VStack>
    </VStack>
  );
}

const StyledNftImage = styled.img`
  min-height: 240px;
  width: auto;
  max-width: 100%;
`;
