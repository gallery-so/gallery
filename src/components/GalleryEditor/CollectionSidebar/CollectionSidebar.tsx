import styled from 'styled-components';

import colors from '~/components/core/colors';
import IconContainer from '~/components/core/Markdown/IconContainer';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleS } from '~/components/core/Text/Text';
import { CollectionSearch } from '~/components/GalleryEditor/CollectionSidebar/CollectionSearch';
import { CreateCollectionIcon } from '~/components/GalleryEditor/CollectionSidebar/CreateCollectionIcon';
import { useGalleryEditorContext } from '~/components/GalleryEditor/GalleryEditorContext';

function TitleSection() {
  const { createCollection } = useGalleryEditorContext();

  return (
    <TitleSectionWrapper align="center" justify="space-between">
      <TitleS>Collections</TitleS>

      <IconContainer
        variant="default"
        size="sm"
        icon={<CreateCollectionIcon />}
        onClick={createCollection}
      />
    </TitleSectionWrapper>
  );
}

export function CollectionSidebar() {
  return (
    <CollectionSidebarWrapper gap={8}>
      <TitleSection />

      <CollectionSearch />
    </CollectionSidebarWrapper>
  );
}

const CollectionSidebarWrapper = styled(VStack)`
  min-width: 250px;
  max-width: 250px;

  height: 100%;

  padding-top: 16px;

  border-right: 1px solid ${colors.porcelain};
`;

const TitleSectionWrapper = styled(HStack)`
  padding: 0 16px;
`;
