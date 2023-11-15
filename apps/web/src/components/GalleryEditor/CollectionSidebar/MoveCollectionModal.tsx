import { useRouter } from 'next/router';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import Checkbox from '~/components/core/Checkbox/Checkbox';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS, TitleDiatypeL } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { MoveCollectionModalFragment$key } from '~/generated/MoveCollectionModalFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';

import { GalleryEditorContextType, StagedCollection } from '../GalleryEditorContext';
import useMoveCollectionToGallery from './useMoveCollectionToGallery';

type Props = {
  queryRef: MoveCollectionModalFragment$key;
  collection: StagedCollection;
  hasUnsavedChanges: boolean;
  handleSaveGallery: GalleryEditorContextType['saveGallery'];
  onSuccess: () => void;
};

export default function MoveCollectionModal({
  collection,
  hasUnsavedChanges,
  handleSaveGallery,
  onSuccess,
  queryRef,
}: Props) {
  const query = useFragment(
    graphql`
      fragment MoveCollectionModalFragment on Query {
        viewer {
          ... on Viewer {
            user {
              galleries {
                dbid
                name
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const moveCollectionToGallery = useMoveCollectionToGallery();

  const { query: routerQuery } = useRouter();
  const galleryId = routerQuery.galleryId as string;

  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const galleries = useMemo(() => {
    return removeNullValues(query.viewer?.user?.galleries).filter(
      (gallery) => gallery.dbid !== galleryId
    );
  }, [query.viewer, galleryId]);

  const { pushToast } = useToastActions();
  const { hideModal } = useModalActions();

  const reportError = useReportError();

  const handleSubmit = useCallback(async () => {
    const gallery = galleries.find((gallery) => gallery.dbid === selectedGalleryId);

    if (!gallery) {
      return;
    }

    if (hasUnsavedChanges) {
      try {
        setIsLoading(true);
        // save the entire gallery with no caption prior to moving the collection.
        // the user will be given ample warning about this.
        await handleSaveGallery();
      } catch (error) {
        reportError('Failed to save gallery changes', {
          tags: {
            galleryId,
          },
        });
        pushToast({ message: 'Failed to save your changes before moving your section' });
        setIsLoading(false);
      }
    }

    try {
      setIsLoading(true);
      await moveCollectionToGallery({
        collectionId: collection.dbid,
        galleryId: gallery.dbid,
        onSucess: () => {
          onSuccess();
          setIsLoading(false);
          pushToast({
            message: `Moved **${collection.name || 'Untitled section'}** to **${
              gallery.name || 'Untitled gallery'
            }**`,
          });

          hideModal();
        },
      });

      setIsLoading(false);
      pushToast({
        message: `Moved **${collection.name || 'Untitled section'}** to **${
          gallery.name || 'Untitled gallery'
        }**`,
      });

      hideModal();
    } catch (error) {
      reportError('Failed to move section', {
        tags: {
          collectionId: collection.dbid,
          toGalleryId: selectedGalleryId,
        },
      });
      pushToast({ message: 'Failed to move your section' });
      setIsLoading(false);
    }
  }, [
    collection.dbid,
    collection.name,
    galleries,
    galleryId,
    handleSaveGallery,
    hasUnsavedChanges,
    hideModal,
    moveCollectionToGallery,
    onSuccess,
    pushToast,
    reportError,
    selectedGalleryId,
  ]);

  const handleOnSelect = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const selectedGalleryId = event.target.value;
    setSelectedGalleryId(selectedGalleryId);
  }, []);

  const collectionDisplayName = collection.name || 'Untitled section';

  const description = useMemo(() => {
    if (hasUnsavedChanges) {
      return (
        <BaseM>
          It looks like you've made updates to <strong>{collectionDisplayName}</strong>. You'll need
          to save your gallery first. Choose a gallery to move{' '}
          <strong>{collectionDisplayName}</strong> to, then press "Save and Move" to move your
          collection.
        </BaseM>
      );
    }
    return (
      <BaseM>
        This will move your section <strong>{collectionDisplayName}</strong> to another gallery.
      </BaseM>
    );
  }, [collectionDisplayName, hasUnsavedChanges]);

  return (
    <StyledMoveCollectionModal gap={8} justify="space-between">
      <VStack gap={8}>
        <VStack>
          {hasUnsavedChanges ? null : <TitleDiatypeL>Move to...</TitleDiatypeL>}
          {description}
        </VStack>

        <StyledCollectionsContainer>
          {galleries.map((gallery) => (
            <StyledCollectionContainer key={gallery.dbid} gap={10} align="center">
              <Checkbox
                checked={selectedGalleryId === gallery.dbid}
                onChange={handleOnSelect}
                value={gallery.dbid}
                label={<BaseS>{gallery.name || 'Untitled'}</BaseS>}
              />
            </StyledCollectionContainer>
          ))}
        </StyledCollectionsContainer>
      </VStack>

      <StyledFooter justify="flex-end">
        <Button
          eventElementId="Move Collection Button"
          eventName="Move Collection"
          eventContext={contexts.Editor}
          onClick={handleSubmit}
          variant="primary"
          disabled={!selectedGalleryId}
          pending={isLoading}
        >
          {hasUnsavedChanges ? 'Save and move' : 'Move'}
        </Button>
      </StyledFooter>
    </StyledMoveCollectionModal>
  );
}

const StyledMoveCollectionModal = styled(VStack)`
  width: 375px;
  min-height: 200px;
  padding-top: 52px;
`;

const StyledCollectionsContainer = styled.div`
  max-height: 200px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    background-color: ${colors.faint};
    width: 8px;
    border-radius: 8px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background-color: ${colors.metal};
  }
`;

const StyledCollectionContainer = styled(HStack)`
  padding: 8px;

  &:hover {
    background-color: ${colors.faint};
  }
`;

const StyledFooter = styled(HStack)`
  padding-top: 12px;
`;
