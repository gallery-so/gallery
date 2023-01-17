import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { GalleryFragment$key } from '~/generated/GalleryFragment.graphql';
import { GalleryFragmentQuery$key } from '~/generated/GalleryFragmentQuery.graphql';
import { useLoggedInUserId } from '~/hooks/useLoggedInUserId';
import PencilIcon from '~/icons/PencilIcon';
import { removeNullValues } from '~/utils/removeNullValues';

import colors from '../core/colors';
import { DropdownItem } from '../core/Dropdown/DropdownItem';
import { DropdownSection } from '../core/Dropdown/DropdownSection';
import SettingsDropdown from '../core/Dropdown/SettingsDropdown';
import { UnstyledLink } from '../core/Link/UnstyledLink';
import IconContainer from '../core/Markdown/IconContainer';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, TitleS, TitleXS } from '../core/Text/Text';
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
          username @required(action: THROW)
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

        viewer {
          ... on Viewer {
            viewerGalleries {
              __typename
              gallery {
                dbid
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const totalGalleries = query.viewer?.viewerGalleries?.length ?? 0;

  if (!gallery?.owner?.username) {
    throw new Error('This gallery does not have an owner.');
  }

  // TODO: Replace with a specific gallery route in the future
  const galleryLink: Route = {
    pathname: '/[username]',
    query: { username: gallery.owner.username },
  };

  const loggedInUserId = useLoggedInUserId(query);
  const isAuthenticatedUser = loggedInUserId === gallery?.owner?.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: gallery.dbid.toString(),
    disabled: !isAuthenticatedUser,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const setFeaturedGallery = useSetFeaturedGallery();
  const updateGalleryHidden = useUpdateGalleryHidden();
  const deleteGallery = useDeleteGallery();

  const { showModal, hideModal } = useModalActions();

  const { name, collections, tokenPreviews, hidden, dbid } = gallery;

  const { pushToast } = useToastActions();

  const handleSetFeaturedGallery = useCallback(() => {
    setFeaturedGallery(dbid);
  }, [dbid, setFeaturedGallery]);

  const handleUpdateGalleryHidden = useCallback(() => {
    updateGalleryHidden(dbid, !hidden);
  }, [dbid, hidden, updateGalleryHidden]);

  const handleDeleteGallery = useCallback(() => {
    if (totalGalleries < 2) {
      pushToast({
        message: 'You cannot delete your only gallery.',
      });
      return;
    }

    deleteGallery(dbid);

    // if delete featured gallery, set another gallery as featured
    if (isFeatured) {
      const otherGallery = removeNullValues(query.viewer?.viewerGalleries).find(
        (viewerGallery) => viewerGallery?.gallery?.dbid !== dbid
      );

      if (otherGallery && otherGallery?.gallery?.dbid) {
        setFeaturedGallery(otherGallery?.gallery?.dbid);
      }
    }
  }, [
    dbid,
    deleteGallery,
    isFeatured,
    pushToast,
    query.viewer?.viewerGalleries,
    setFeaturedGallery,
    totalGalleries,
  ]);

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
    <StyledGalleryWrapper isDragging={isDragging} ref={setNodeRef}>
      <StyledGalleryDraggable
        gap={12}
        isAuthedUser={isAuthenticatedUser}
        style={style}
        {...attributes}
        {...listeners}
      >
        <HStack justify="space-between">
          <StyledGalleryTitleWrapper isHidden={hidden}>
            <UnstyledLink href={galleryLink}>
              <StyledGalleryTitle>{name || 'Untitled'}</StyledGalleryTitle>
            </UnstyledLink>
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
                  <IconContainer size="md" icon={<PencilIcon />} />
                </a>
              </Link>
              <SettingsDropdown>
                <DropdownSection>
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
                </DropdownSection>
              </SettingsDropdown>
            </>
          )}
        </HStack>
      </StyledGalleryActionsContainer>
    </StyledGalleryWrapper>
  );
}

const StyledGalleryWrapper = styled.div<{ isDragging?: boolean }>`
  position: relative;
  opacity: ${({ isDragging }) => (isDragging ? 0.5 : 1)};
`;

const StyledGalleryDraggable = styled(VStack)<{ isAuthedUser: boolean }>`
  padding: 12px;
  cursor: ${({ isAuthedUser }) => (isAuthedUser ? 'grab' : 'default')};
  min-height: 310px;
  height: 100%;
  border-radius: 12px;
  background-color: ${colors.offWhite};

  &:hover {
    background-color: ${({ isAuthedUser }) => (isAuthedUser ? colors.faint : 'transparent')};
  }
`;

const StyledGalleryTitleWrapper = styled(VStack)<{ isHidden?: boolean }>`
  opacity: ${({ isHidden = false }) => (isHidden ? 0.5 : 1)};
`;

const StyledGalleryTitle = styled(TitleS)`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
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
  gap: 2px;
  opacity: ${({ isHidden }) => (isHidden ? 0.5 : 1)};
`;
const StyledTokenPreview = styled.img`
  height: auto;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
`;

const StyledGalleryActionsContainer = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
`;
