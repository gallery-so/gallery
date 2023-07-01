import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { CollectionEditor } from '~/components/GalleryEditor/CollectionEditor/CollectionEditor';
import { CollectionSidebar } from '~/components/GalleryEditor/CollectionSidebar/CollectionSidebar';
import { PiecesSidebar } from '~/components/GalleryEditor/PiecesSidebar/PiecesSidebar';
import { CollectionEditorProvider } from '~/contexts/collectionEditor/CollectionEditorContext';
import { GalleryEditorFragment$key } from '~/generated/GalleryEditorFragment.graphql';
import { GalleryEditorViewerFragment$key } from '~/generated/GalleryEditorViewerFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type GalleryEditorProps = {
  queryRef: GalleryEditorFragment$key;
};

const galleryEditorViewerFragment = graphql`
  fragment GalleryEditorViewerFragment on Viewer {
    user {
      tokens(ownershipFilter: [Creator, Holder]) {
        ...PiecesSidebarFragment
      }
    }
  }
`;

export function GalleryEditor({ queryRef }: GalleryEditorProps) {
  const query = useFragment(
    graphql`
      fragment GalleryEditorFragment on Query {
        ...CollectionEditorFragment
        ...PiecesSidebarViewerFragment
        ...CollectionSidebarQueryFragment

        viewer {
          ... on Viewer {
            ...GalleryEditorViewerFragment
          }
        }
      }
    `,
    queryRef
  );

  const viewer = useFragment<GalleryEditorViewerFragment$key>(
    galleryEditorViewerFragment,
    query.viewer
  );

  if (!viewer) {
    throw new Error('GalleryEditor rendered without a Viewer');
  }

  const allTokens = useMemo(() => {
    return removeNullValues(viewer.user?.tokens);
  }, [viewer]);

  return (
    <GalleryEditorWrapper>
      <CollectionEditorProvider>
        <CollectionSidebar queryRef={query} />

        <CollectionEditor queryRef={query} />

        <PiecesSidebar tokensRef={allTokens} queryRef={query} />
      </CollectionEditorProvider>
    </GalleryEditorWrapper>
  );
}

const GalleryEditorWrapper = styled(HStack)`
  height: 100%;
`;
