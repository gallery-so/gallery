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
                hidden
              }
            }
          }
        }
      }
    `,
    queryRef
  );

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

  const reassignFeaturedGallery = useCallback(() => {
    if (!isFeatured) return;

    const otherGallery = removeNullValues(query.viewer?.viewerGalleries)
      .filter((viewerGallery) => !viewerGallery?.gallery?.hidden)
      .find((viewerGallery) => viewerGallery?.gallery?.dbid !== dbid);

    if (otherGallery && otherGallery?.gallery?.dbid) {
      setFeaturedGallery(otherGallery?.gallery?.dbid);
    }
  }, [dbid, isFeatured, query.viewer?.viewerGalleries, setFeaturedGallery]);

  const checkIfItsLastVisibleGallery = useCallback(() => {
    const visibleGalleries = removeNullValues(query.viewer?.viewerGalleries).filter(
      (viewerGallery) => !viewerGallery?.gallery?.hidden
    );

    return visibleGalleries.length < 2;
  }, [query.viewer?.viewerGalleries]);

  const handleSetFeaturedGallery = useCallback(() => {
    setFeaturedGallery(dbid);
  }, [dbid, setFeaturedGallery]);

  const handleUpdateGalleryHidden = useCallback(() => {
    const isLastGallery = checkIfItsLastVisibleGallery();

    if (isLastGallery && !hidden) {
      pushToast({
        message: 'You cannot hide your only gallery.',
      });
      return;
    }

    updateGalleryHidden(dbid, !hidden);

    // if hide featured gallery, set another gallery as featured
    reassignFeaturedGallery();
  }, [
    checkIfItsLastVisibleGallery,
    dbid,
    hidden,
    pushToast,
    reassignFeaturedGallery,
    updateGalleryHidden,
  ]);

  const handleDeleteGallery = useCallback(() => {
    const isLastGallery = checkIfItsLastVisibleGallery();

    if (isLastGallery && !hidden) {
      pushToast({
        message: 'You cannot delete your only gallery.',
      });
      return;
    }

    deleteGallery(dbid);

    // if delete featured gallery, set another gallery as featured
    reassignFeaturedGallery();
  }, [
    checkIfItsLastVisibleGallery,
    dbid,
    deleteGallery,
    hidden,
    pushToast,
    reassignFeaturedGallery,
  ]);

  const handleEditGalleryName = useCallback(() => {
    showModal({
      content: <GalleryNameAndDescriptionModal galleryRef={gallery} onNext={hideModal} />,
      headerText: 'Add a gallery name and description',
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

  const galleryView = (
    <StyledGalleryWrapper isDragging={isDragging} ref={setNodeRef}>
      <StyledGalleryDraggable
        gap={12}
        isAuthedUser={isAuthenticatedUser}
        style={style}
        {...attributes}
        {...listeners}
      >
        <StyledTokenPreviewWrapper isHidden={hidden}>
          {nonNullTokenPreviews.map((token) => (
            <StyledTokenPreview key={token} src={token} />
          ))}
        </StyledTokenPreviewWrapper>
      </StyledGalleryDraggable>
      <StyledGalleryTitleContainer justify="space-between">
        <StyledGalleryTitleWrapper isHidden={hidden}>
          <UnstyledLink href={galleryLink}>
            <StyledGalleryTitle tabIndex={1}>{name || 'Untitled'}</StyledGalleryTitle>
          </UnstyledLink>
          <BaseM>{collections.length} collections</BaseM>
        </StyledGalleryTitleWrapper>
      </StyledGalleryTitleContainer>
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

  return isAuthenticatedUser ? (
    galleryView
  ) : (
    <UnstyledLink href={galleryLink}>{galleryView}</UnstyledLink>
  );
}

const StyledGalleryWrapper = styled.div<{ isDragging?: boolean }>`
  position: relative;
  opacity: ${({ isDragging }) => (isDragging ? 0.5 : 1)};
  height: 100%;
  max-width: 520px;
`;

const StyledGalleryDraggable = styled(VStack)<{ isAuthedUser: boolean }>`
  /* text height + padding 12px vertically */
  padding: calc(40px + 12px + 12px) 12px 12px;
  cursor: ${({ isAuthedUser }) => (isAuthedUser ? 'grab' : 'pointer')};
  min-height: 400px;
  height: 100%;
  border-radius: 12px;
  background-color: ${colors.offWhite};

  &:hover {
    background-color: ${colors.faint};
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

const StyledGalleryTitleContainer = styled(HStack)`
  position: absolute;
  top: 12px;
  left: 12px;
`;

const StyledGalleryActionsContainer = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
`;
