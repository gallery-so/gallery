import { GalleryEditorFragment$key } from '__generated__/GalleryEditorFragment.graphql';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { CollectionEditor } from '~/components/GalleryEditor/CollectionEditor/CollectionEditor';
import { CollectionSidebar } from '~/components/GalleryEditor/CollectionSidebar';
import { GalleryEditorProvider } from '~/components/GalleryEditor/GalleryEditorContext';
import CollectionEditorProvider from '~/contexts/collectionEditor/CollectionEditorContext';
import CollectionWizardContext from '~/contexts/wizard/CollectionWizardContext';

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
      }
    `,
    queryRef
  );

  return (
    <GalleryEditorProvider queryRef={query}>
      <GalleryEditorWrapper>
        <CollectionSidebar queryRef={query} />

        <CollectionEditorProvider>
          <CollectionEditor
            onValidChange={() => {}}
            onHasUnsavedChange={() => {}}
            hasUnsavedChanges={false}
            queryRef={query}
          />
        </CollectionEditorProvider>
      </GalleryEditorWrapper>
    </GalleryEditorProvider>
  );
}

const GalleryEditorWrapper = styled(HStack)`
  height: 100%;
`;
