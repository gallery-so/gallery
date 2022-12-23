import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import IconContainer from '~/components/core/Markdown/IconContainer';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleS } from '~/components/core/Text/Text';
import { CollectionSearch } from '~/components/GalleryEditor/CollectionSidebar/CollectionSearch';
import { CreateCollectionIcon } from '~/components/GalleryEditor/CollectionSidebar/CreateCollectionIcon';
import { useGalleryEditorContext } from '~/components/GalleryEditor/GalleryEditorContext';
import { CollectionSidebarFragment$key } from '~/generated/CollectionSidebarFragment.graphql';

function TitleSection() {
  const { createCollection } = useGalleryEditorContext();

  return (
    <TitleSectionWrapper align="center" justify="space-between">
      <TitleS>Collections</TitleS>

      <IconContainer size="sm" icon={<CreateCollectionIcon />} onClick={createCollection} />
    </TitleSectionWrapper>
  );
}

type CollectionSidebarProps = {
  queryRef: CollectionSidebarFragment$key;
};

export function CollectionSidebar({ queryRef }: CollectionSidebarProps) {
  const query = useFragment(
    graphql`
      fragment CollectionSidebarFragment on Query {
        ...CollectionSearchFragment
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

  height: 100%;

  padding-top: 16px;

  border-right: 1px solid ${colors.porcelain};
`;

const TitleSectionWrapper = styled(HStack)`
  padding: 0 16px;
`;
