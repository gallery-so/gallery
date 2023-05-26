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
import { removeNullValues } from '~/shared/relay/removeNullValues';

type GalleryEditorProps = {
  queryRef: GalleryEditorFragment$key;
};

export function GalleryEditor({ queryRef }: GalleryEditorProps) {
  const query = useFragment(
    graphql`
      fragment GalleryEditorFragment on Query {
        ...CollectionEditorFragment
        ...PiecesSidebarViewerFragment
        ...CollectionSidebarQueryFragment

        viewer {
          __typename

          ... on Viewer {
            user {
              tokens {
                ...PiecesSidebarFragment
              }
              # [GAL-2710] createdTokens
              # createdTokens {
              #   ...CreatedPiecesSidebarFragment
              # }
            }
          }
        }
      }
    `,
    queryRef
  );

  const allTokens = useMemo(() => {
    if (query.viewer?.__typename !== 'Viewer') {
      return [];
    }

    return removeNullValues(query.viewer?.user?.tokens);
  }, [query.viewer]);

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
