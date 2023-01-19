import { GalleryEditorFragment$key } from '__generated__/GalleryEditorFragment.graphql';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { CollectionEditor } from '~/components/GalleryEditor/CollectionEditor/CollectionEditor';
import { CollectionSidebar } from '~/components/GalleryEditor/CollectionSidebar/CollectionSidebar';
import { useGalleryEditorContext } from '~/components/GalleryEditor/GalleryEditorContext';
import { PiecesSidebar } from '~/components/GalleryEditor/PiecesSidebar/PiecesSidebar';
import useConfirmationMessageBeforeClose from '~/components/ManageGallery/useConfirmationMessageBeforeClose';
import FullPageStep from '~/components/Onboarding/FullPageStep';
import { CollectionEditorProviderNew } from '~/contexts/collectionEditor/CollectionEditorContextNew';
import { EditGalleryNavbar } from '~/contexts/globalLayout/EditGalleryNavbar/EditGalleryNavbar';
import { useCanGoBack } from '~/contexts/navigation/GalleryNavigationProvider';
import { removeNullValues } from '~/utils/removeNullValues';

type GalleryEditorProps = {
  queryRef: GalleryEditorFragment$key;
};

export function GalleryEditor({ queryRef }: GalleryEditorProps) {
  const query = useFragment(
    graphql`
      fragment GalleryEditorFragment on Query {
        ...GalleryEditorContextFragment
        ...CollectionEditorNewFragment
        ...PiecesSidebarViewerNewFragment

        viewer {
          __typename

          ... on Viewer {
            user {
              username
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

  const canGoBack = useCanGoBack();
  const { replace, back } = useRouter();
  const { saveGallery, canSave, hasUnsavedChanges, editGalleryNameAndDescription, name } =
    useGalleryEditorContext();

  useConfirmationMessageBeforeClose(hasUnsavedChanges);

  const handleBack = useCallback(() => {
    if (canGoBack) {
      back();
    } else if (query.viewer?.__typename === 'Viewer' && query.viewer.user?.username) {
      replace({
        pathname: '/[username]/galleries',
        query: { username: query.viewer.user.username },
      });
    } else {
      replace({ pathname: '/home' });
    }
  }, [back, canGoBack, query.viewer, replace]);

  const handleDone = useCallback(
    async (caption: string) => {
      await saveGallery(caption);
    },
    [saveGallery]
  );

  const handleEdit = useCallback(() => {
    editGalleryNameAndDescription();
  }, [editGalleryNameAndDescription]);

  const allTokens = useMemo(() => {
    if (query.viewer?.__typename !== 'Viewer') {
      return [];
    }

    return removeNullValues(query.viewer?.user?.tokens);
  }, [query.viewer]);

  return (
    <FullPageStep
      withBorder
      navbar={
        <EditGalleryNavbar
          onEdit={handleEdit}
          galleryName={name}
          canSave={canSave}
          hasUnsavedChanges={hasUnsavedChanges}
          onBack={handleBack}
          onDone={handleDone}
        />
      }
    >
      <GalleryEditorWrapper>
        <CollectionEditorProviderNew>
          <CollectionSidebar />

          <CollectionEditor queryRef={query} />

          <PiecesSidebar tokensRef={allTokens} queryRef={query} />
        </CollectionEditorProviderNew>
      </GalleryEditorWrapper>
    </FullPageStep>
  );
}

const GalleryEditorWrapper = styled(HStack)`
  height: 100%;
`;
