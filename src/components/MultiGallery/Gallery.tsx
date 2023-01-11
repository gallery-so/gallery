import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { GalleryFragment$key } from '~/generated/GalleryFragment.graphql';
import { GalleryFragmentQuery$key } from '~/generated/GalleryFragmentQuery.graphql';
import { useLoggedInUserId } from '~/hooks/useLoggedInUserId';
import PencilIcon from '~/icons/PencilIcon';
import { removeNullValues } from '~/utils/removeNullValues';

import colors from '../core/colors';
import { DropdownItem } from '../core/Dropdown/DropdownItem';
import SettingsDropdown from '../core/Dropdown/SettingsDropdown';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, TitleDiatypeM, TitleXS } from '../core/Text/Text';
import GalleryNameAndDescriptionModal from './GalleryNameAndDescriptionModal';
import useDeleteGallery from './useDeleteGallery';
import useSetFeaturedGallery from './useSetFeaturedGallery';
import useUpdateGalleryHidden from './useUpdateGalleryHidden';

type Props = {
  isFeatured?: boolean;
  galleryRef: GalleryFragment$key;
  queryRef: GalleryFragmentQuery$key;
};

export default function Gallery({ isFeatured = false, galleryRef, queryRef }: Props) {
  const gallery = useFragment(
    graphql`
      fragment GalleryFragment on Gallery {
        dbid
        id
        name
        tokenPreviews @required(action: THROW)
        hidden @required(action: THROW)
        collections @required(action: THROW) {
          id
        }
        owner {
          id
        }
        ...GalleryNameAndDescriptionModalFragment
      }
    `,
    galleryRef
  );

  const query = useFragment(
    graphql`
      fragment GalleryFragmentQuery on Query {
        ...useLoggedInUserIdFragment
      }
    `,
    queryRef
  );

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: gallery.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const setFeaturedGallery = useSetFeaturedGallery();
  const updateGalleryHidden = useUpdateGalleryHidden();
  const deleteGallery = useDeleteGallery();

  const loggedInUserId = useLoggedInUserId(query);
  const isAuthenticatedUser = loggedInUserId === gallery?.owner?.id;

  const { showModal, hideModal } = useModalActions();

  const { name, collections, tokenPreviews, hidden, dbid } = gallery;

  const handleSetFeaturedGallery = useCallback(() => {
    setFeaturedGallery(dbid);
  }, [dbid, setFeaturedGallery]);

  const handleUpdateGalleryHidden = useCallback(() => {
    updateGalleryHidden(dbid, !hidden);
  }, [dbid, hidden, updateGalleryHidden]);

  const handleDeleteGallery = useCallback(() => {
    deleteGallery(dbid);
  }, [dbid, deleteGallery]);

  const handleEditGalleryName = useCallback(() => {
    showModal({
      content: <GalleryNameAndDescriptionModal galleryRef={gallery} onNext={hideModal} />,
      headerText: 'Name and descripton of your gallery',
    });
  }, [hideModal, gallery, showModal]);

  const handleEditGallery: Route = useMemo(() => {
    return {
      pathname: '/gallery/[galleryId]/edit',
      query: { galleryId: dbid },
    };
  }, [dbid]);

  const nonNullTokenPreviews = removeNullValues(tokenPreviews) ?? [];

  if (!isAuthenticatedUser && hidden) return null;

  return (
    <StyledGalleryWrapper>
      <StyledGalleryDraggable
        gap={12}
        isDragging={isDragging}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
      >
        <HStack justify="space-between">
          <StyledGalleryTitleWrapper isHidden={hidden}>
            <TitleDiatypeM>{name || 'Untitled'}</TitleDiatypeM>
            <BaseM>{collections.length} collections</BaseM>
          </StyledGalleryTitleWrapper>
        </HStack>
        <StyledTokenPreviewWrapper isHidden={hidden}>
          {nonNullTokenPreviews.map((token) => (
            <StyledTokenPreview key={token} src={token} />
          ))}
        </StyledTokenPreviewWrapper>
      </StyledGalleryDraggable>
      <StyledGalleryActionsContainer>
        <HStack gap={8} align="center">
          {isFeatured && <StyledGalleryFeaturedText as="span">Featured</StyledGalleryFeaturedText>}
          {isAuthenticatedUser && (
            <>
              <Link href={handleEditGallery}>
                <a>
                  <PencilIcon />
                </a>
              </Link>
              <SettingsDropdown>
                <DropdownItem onClick={handleEditGalleryName}>EDIT NAME & DESC</DropdownItem>
                {hidden ? (
                  <DropdownItem onClick={handleUpdateGalleryHidden}>UNHIDE</DropdownItem>
                ) : (
                  <>
                    {!isFeatured && (
                      <DropdownItem onClick={handleSetFeaturedGallery}>
                        FEATURE ON PROFILE
                      </DropdownItem>
                    )}
                    <DropdownItem onClick={handleUpdateGalleryHidden}>HIDE</DropdownItem>
                  </>
                )}
                <DropdownItem onClick={handleDeleteGallery}>DELETE</DropdownItem>
              </SettingsDropdown>
            </>
          )}
        </HStack>
      </StyledGalleryActionsContainer>
    </StyledGalleryWrapper>
  );
}

const StyledGalleryWrapper = styled.div`
  position: relative;
`;

const StyledGalleryDraggable = styled(VStack)<{ isDragging?: boolean }>`
  padding: 12px;
  opacity: ${({ isDragging }) => (isDragging ? 0.5 : 1)};
  cursor: ${({ isDragging }) => (isDragging ? 'grabbing' : 'grab')};
  min-height: 310px;
  height: 100%;
  &:hover {
    background-color: ${colors.faint};
  }
`;

const StyledGalleryTitleWrapper = styled(VStack)<{ isHidden?: boolean }>`
  opacity: ${({ isHidden = false }) => (isHidden ? 0.5 : 1)};
`;

const StyledGalleryFeaturedText = styled(TitleXS)`
  border: 1px solid ${colors.activeBlue};
  border-radius: 2px;
  padding: 2px 4px;
  color: ${colors.activeBlue};
  font-weight: 500;
`;

const StyledTokenPreviewWrapper = styled.div<{ isHidden?: boolean }>`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  opacity: ${({ isHidden }) => (isHidden ? 0.5 : 1)};
`;
const StyledTokenPreview = styled.img`
  width: 100%;
`;

const StyledGalleryActionsContainer = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
`;
