import { useRouter } from 'next/router';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import Checkbox from '~/components/core/Checkbox/Checkbox';
import colors from '~/components/core/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS, TitleDiatypeL } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { MoveCollectionModalFragment$key } from '~/generated/MoveCollectionModalFragment.graphql';
import { removeNullValues } from '~/utils/removeNullValues';

import { CollectionState } from '../GalleryEditorContext';
import useMoveCollectionToGallery from './useMoveCollectionToGallery';

type Props = {
  queryRef: MoveCollectionModalFragment$key;
  collection: CollectionState;
  onSuccess: () => void;
};

export default function MoveCollectionModal({ collection, onSuccess, queryRef }: Props) {
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

  const handleSubmit = useCallback(async () => {
    const gallery = galleries.find((gallery) => gallery.dbid === selectedGalleryId);

    if (!gallery) {
      return;
    }

    try {
      setIsLoading(true);
      moveCollectionToGallery({
        collectionId: collection.dbid,
        galleryId: gallery.dbid,
        onSucess: () => {
          onSuccess();
          setIsLoading(false);
          pushToast({
            message: `Moved **${collection.name || 'Untitled collection'}** to **${
              gallery.name || 'Untitled gallery'
            }**`,
          });

          hideModal();
        },
      });

      setIsLoading(false);
      pushToast({
        message: `Moved **${collection.name || 'Untitled collection'}** to **${
          gallery.name || 'Untitled gallery'
        }**`,
      });

      hideModal();
    } catch (error) {
      setIsLoading(false);
    }
  }, [
    collection,
    galleries,
    hideModal,
    moveCollectionToGallery,
    onSuccess,
    pushToast,
    selectedGalleryId,
  ]);

  const handleOnSelect = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const selectedGalleryId = event.target.value;
    setSelectedGalleryId(selectedGalleryId);
  }, []);

  const isButtonDisabled = useMemo(() => {
    return !selectedGalleryId;
  }, [selectedGalleryId]);

  return (
    <StyledMoveCollectionModal gap={8} justify="space-between">
      <VStack gap={8}>
        <VStack>
          <TitleDiatypeL>Move to...</TitleDiatypeL>
          <BaseM>
            This will move your collection{' '}
            <strong>{collection.name || 'Untitled collection'}</strong> to another gallery
          </BaseM>
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
        <StyledButton
          onClick={handleSubmit}
          variant="primary"
          disabled={isButtonDisabled}
          pending={isLoading}
        >
          MOVE
        </StyledButton>
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

const StyledButton = styled(Button)`
  width: 68px;
`;
