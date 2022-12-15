import { GalleryEditorFragment$key } from '__generated__/GalleryEditorFragment.graphql';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { CollectionEditor } from '~/components/GalleryEditor/CollectionEditor/CollectionEditor';
import { CollectionSidebar } from '~/components/GalleryEditor/CollectionSidebar/CollectionSidebar';
import { GalleryEditorProvider } from '~/components/GalleryEditor/GalleryEditorContext';
import { PiecesSidebar } from '~/components/GalleryEditor/PiecesSidebar/PiecesSidebar';
import CollectionEditorProvider from '~/contexts/collectionEditor/CollectionEditorContext';
import CollectionWizardContext from '~/contexts/wizard/CollectionWizardContext';
import { removeNullValues } from '~/utils/removeNullValues';

type GalleryEditorProps = {
  queryRef: GalleryEditorFragment$key;
};

export function GalleryEditor({ queryRef }: GalleryEditorProps) {
  const query = useFragment(
    graphql`
      fragment GalleryEditorFragment on Query {
        ...CollectionSidebarFragment
        ...GalleryEditorContextFragment
        ...CollectionEditorNewFragment
        ...PiecesSidebarViewerNewFragment

        viewer {
          ... on Viewer {
            user {
              tokens {
                ...PiecesSidebarNewFragment
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  console.log({ query });

  const allTokens = useMemo(() => {
    return removeNullValues(query.viewer?.user?.tokens);
  }, [query.viewer?.user?.tokens]);

  return (
    <GalleryEditorProvider queryRef={query}>
      <GalleryEditorWrapper>
        <CollectionEditorProvider>
          <CollectionSidebar queryRef={query} />

          <CollectionEditor
            onValidChange={() => {}}
            onHasUnsavedChange={() => {}}
            hasUnsavedChanges={false}
            queryRef={query}
          />

          <PiecesSidebar tokensRef={allTokens} queryRef={query} />
        </CollectionEditorProvider>
      </GalleryEditorWrapper>
    </GalleryEditorProvider>
  );
}

const GalleryEditorWrapper = styled(HStack)`
  height: 100%;
`;
