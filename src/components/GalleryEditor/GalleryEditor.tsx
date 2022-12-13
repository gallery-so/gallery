import { GalleryEditorFragment$key } from '__generated__/GalleryEditorFragment.graphql';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { CollectionSidebar } from '~/components/GalleryEditor/CollectionSidebar';

type GalleryEditorProps = {
  queryRef: GalleryEditorFragment$key;
};

export function GalleryEditor({ queryRef }: GalleryEditorProps) {
  const query = useFragment(
    graphql`
      fragment GalleryEditorFragment on Query {
        ...CollectionSidebarFragment
      }
    `,
    queryRef
  );

  return (
    <GalleryEditorWrapper>
      <CollectionSidebar queryRef={query} />
    </GalleryEditorWrapper>
  );
}

const GalleryEditorWrapper = styled(HStack)`
  height: 100%;
`;
