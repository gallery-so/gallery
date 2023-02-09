import { GalleryEditorFragment$key } from '__generated__/GalleryEditorFragment.graphql';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { CollectionEditor } from '~/components/GalleryEditor/CollectionEditor/CollectionEditor';
import { CollectionSidebar } from '~/components/GalleryEditor/CollectionSidebar/CollectionSidebar';
import { PiecesSidebar } from '~/components/GalleryEditor/PiecesSidebar/PiecesSidebar';
import { CollectionEditorProviderNew } from '~/contexts/collectionEditor/CollectionEditorContextNew';
import { removeNullValues } from '~/utils/removeNullValues';

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
      <CollectionEditorProviderNew>
        <CollectionSidebar queryRef={query} />

        <CollectionEditor queryRef={query} />

        <PiecesSidebar tokensRef={allTokens} queryRef={query} />
      </CollectionEditorProviderNew>
    </GalleryEditorWrapper>
  );
}

const GalleryEditorWrapper = styled(HStack)`
  height: 100%;
`;
