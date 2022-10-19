import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CollectionEditorCenterContentFragment$key } from '__generated__/CollectionEditorCenterContentFragment.graphql';
import {
  EditingText,
  MainGalleryText,
} from 'contexts/globalLayout/GlobalNavbar/GalleryEditNavbar/GalleryEditCenterContent';
import { BODY_FONT_FAMILY, Paragraph } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import { HStack } from 'components/core/Spacer/Stack';
import styled from 'styled-components';

type CollectionEditorCenterContentProps = {
  queryRef: CollectionEditorCenterContentFragment$key;
};

export function CollectionEditorCenterContent({ queryRef }: CollectionEditorCenterContentProps) {
  const query = useFragment(
    graphql`
      fragment CollectionEditorCenterContentFragment on Query {
        collectionById(id: $collectionId) {
          ... on Collection {
            name
          }
        }
      }
    `,
    queryRef
  );

  return (
    <HStack gap={8} align="baseline">
      <StyledMainGalleryText>My main gallery</StyledMainGalleryText>

      <CollectionName>/</CollectionName>

      <CollectionName>{query.collectionById?.name}</CollectionName>

      <EditingText>EDITING</EditingText>
    </HStack>
  );
}

const StyledMainGalleryText = styled(MainGalleryText)`
  color: ${colors.metal};
`;

const CollectionName = styled(Paragraph)`
  font-family: ${BODY_FONT_FAMILY};
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 21px;
  letter-spacing: -0.04em;
  
  color ${colors.offBlack}
`;
