import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { GalleryFragment$key } from '~/generated/GalleryFragment.graphql';
import { useLoggedInUserIdFragment$key } from '~/generated/useLoggedInUserIdFragment.graphql';
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
  queryRef: useLoggedInUserIdFragment$key;
};

export default function Gallery({ isFeatured = false, galleryRef, queryRef }: Props) {
  const query = useFragment(
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

  const setFeaturedGallery = useSetFeaturedGallery();
  const updateGalleryHidden = useUpdateGalleryHidden();
  const deleteGallery = useDeleteGallery();

  const loggedInUserId = useLoggedInUserId(queryRef);
  const isAuthenticatedUser = loggedInUserId === query?.owner?.id;

  const { showModal, hideModal } = useModalActions();

  const handleSetFeaturedGallery = useCallback(() => {
    setFeaturedGallery(query.dbid);
  }, [query.dbid, setFeaturedGallery]);

  const handleUpdateGalleryHidden = useCallback(() => {
    updateGalleryHidden(query.dbid, !query.hidden);
  }, [query.dbid, query.hidden, updateGalleryHidden]);

  const handleDeleteGallery = useCallback(() => {
    deleteGallery(query.dbid);
  }, [query.dbid, deleteGallery]);

  const handleEditGalleryName = useCallback(() => {
    showModal({
      content: <GalleryNameAndDescriptionModal galleryRef={query} onNext={hideModal} />,
      headerText: 'Name and descripton of your gallery',
    });
  }, [showModal]);

  const handleEditGallery: Route = useMemo(() => {
    return {
      pathname: '/gallery/[galleryId]/edit',
      query: { galleryId: query.dbid },
    };
  }, [query.dbid]);

  const { name, collections, tokenPreviews, hidden } = query;

  const nonNullTokenPreviews = removeNullValues(tokenPreviews) ?? [];

  if (!isAuthenticatedUser && hidden) return null;

  return (
    <StyledGalleryWrapper gap={12}>
      <StyledGalleryHeader justify="space-between">
        <StyledGalleryTitleWrapper isHidden={hidden}>
          <TitleDiatypeM>{name || 'Untitled'}</TitleDiatypeM>
          <BaseM>{collections.length} collections</BaseM>
        </StyledGalleryTitleWrapper>
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
      </StyledGalleryHeader>
      <StyledTokenPreviewWrapper isHidden={hidden}>
        {nonNullTokenPreviews.map((token) => (
          <StyledTokenPreview key={token} src={token} />
        ))}
      </StyledTokenPreviewWrapper>
    </StyledGalleryWrapper>
  );
}

const StyledGalleryWrapper = styled(VStack)`
  padding: 12px;
`;
const StyledGalleryHeader = styled(HStack)``;

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
