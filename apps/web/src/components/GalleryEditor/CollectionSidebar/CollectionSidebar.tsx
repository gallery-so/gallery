import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import IconContainer from '~/components/core/IconContainer';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleS } from '~/components/core/Text/Text';
import { CollectionSearch } from '~/components/GalleryEditor/CollectionSidebar/CollectionSearch';
import { CreateCollectionIcon } from '~/components/GalleryEditor/CollectionSidebar/CreateCollectionIcon';
import { useGalleryEditorContext } from '~/components/GalleryEditor/GalleryEditorContext';
import { CollectionSidebarQueryFragment$key } from '~/generated/CollectionSidebarQueryFragment.graphql';

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

type Props = {
  queryRef: CollectionSidebarQueryFragment$key;
};
export function CollectionSidebar({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CollectionSidebarQueryFragment on Query {
        ...CollectionSearchQueryFragment
      }
    `,
    queryRef
  );

  return (
    <CollectionSidebarWrapper gap={8}>
      <TitleSection />

      <CollectionSearch queryRef={query} />
    </CollectionSidebarWrapper>
  );
}

const CollectionSidebarWrapper = styled(VStack)`
  min-width: 250px;
  max-width: 250px;

  overflow-y: auto;
  max-height: 100%;
  height: 100%;

  padding-top: 16px;

  border-right: 1px solid ${colors.porcelain};
`;

const TitleSectionWrapper = styled(HStack)`
  padding: 0 16px;
`;
