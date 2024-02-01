import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { GalleryFragment$key } from '~/generated/GalleryFragment.graphql';
import { GalleryFragmentQuery$key } from '~/generated/GalleryFragmentQuery.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import ArrowDownIcon from '~/icons/ArrowDownIcon';
import ArrowUpIcon from '~/icons/ArrowUpIcon';
import DragHandleIcon from '~/icons/DragHandleIcon';
import { EditPencilIcon } from '~/icons/EditPencilIcon';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import colors from '~/shared/theme/colors';
import { noop } from '~/shared/utils/noop';

import { DropdownItem } from '../core/Dropdown/DropdownItem';
import { DropdownSection } from '../core/Dropdown/DropdownSection';
import SettingsDropdown from '../core/Dropdown/SettingsDropdown';
import IconContainer from '../core/IconContainer';
import { UnstyledLink } from '../core/Link/UnstyledLink';
import { HStack, VStack } from '../core/Spacer/Stack';
import { TitleS, TitleXS } from '../core/Text/Text';
import DeleteGalleryConfirmation from './DeleteGalleryConfirmation';
import useSetFeaturedGallery from './useSetFeaturedGallery';
import useUpdateGalleryHidden from './useUpdateGalleryHidden';

export type GalleryOrderDirection = 'up' | 'down';

type Props = {
  isFeatured?: boolean;
  galleryRef: GalleryFragment$key;
  queryRef: GalleryFragmentQuery$key;

  onGalleryOrderChange?: (galleryId: string, direction: GalleryOrderDirection) => void;
};

const TOTAL_TOKENS = 4;

export default function Gallery({
  isFeatured = false,
  galleryRef,
  onGalleryOrderChange = noop,
  queryRef,
}: Props) {
  const gallery = useFragment(
    graphql`
      fragment GalleryFragment on Gallery {
        dbid
        id
        name
        tokenPreviews @required(action: THROW) {
          __typename
          large
        }
        hidden @required(action: THROW)
        owner {
          id
          username @required(action: THROW)
        }
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

  const router = useRouter();
  const { mode } = router.query;

  if (!gallery?.owner?.username) {
    throw new Error('This gallery does not have an owner.');
  }

  const loggedInUserId = useLoggedInUserId(query);
  const isAuthenticatedUser = loggedInUserId === gallery?.owner?.id;
  const isMobile = useIsMobileWindowWidth();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: gallery.dbid.toString(),
    disabled: !isAuthenticatedUser || isMobile,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const setFeaturedGallery = useSetFeaturedGallery();
  const updateGalleryHidden = useUpdateGalleryHidden();

  const { showModal } = useModalActions();

  const { name, tokenPreviews, hidden, dbid } = gallery;

  const { pushToast } = useToastActions();

  const reassignFeaturedGallery = useCallback(async () => {
    if (!isFeatured) return;

    const otherGallery = removeNullValues(query.viewer?.viewerGalleries)
      .filter((viewerGallery) => !viewerGallery?.gallery?.hidden)
      .find((viewerGallery) => viewerGallery?.gallery?.dbid !== dbid);

    if (otherGallery && otherGallery?.gallery?.dbid) {
      try {
        await setFeaturedGallery(otherGallery?.gallery?.dbid);
      } catch (error) {
        if (error instanceof Error) {
          pushToast({
            message: 'Unfortunately there was an error to featured this gallery',
          });
        }
      }
    }
  }, [dbid, isFeatured, pushToast, query.viewer?.viewerGalleries, setFeaturedGallery]);

  const checkIfItsLastVisibleGallery = useCallback(() => {
    const visibleGalleries = removeNullValues(query.viewer?.viewerGalleries).filter(
      (viewerGallery) => viewerGallery?.gallery && !viewerGallery?.gallery?.hidden
    );

    return visibleGalleries.length < 2;
  }, [query.viewer?.viewerGalleries]);

  const handleSetFeaturedGallery = useCallback(async () => {
    try {
      await setFeaturedGallery(dbid);
    } catch (error) {
      if (error instanceof Error) {
        pushToast({
          message: 'Unfortunately there was an error to featured this gallery',
        });
      }
    }
  }, [dbid, pushToast, setFeaturedGallery]);

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
    showModal({
      content: (
        <DeleteGalleryConfirmation
          galleryId={gallery.dbid}
          isLastGallery={isLastGallery}
          onSuccess={reassignFeaturedGallery}
        />
      ),
      isFullPage: false,
    });
  }, [checkIfItsLastVisibleGallery, gallery, reassignFeaturedGallery, showModal]);

  const galleryLink: Route = {
    pathname: '/[username]/galleries/[galleryId]',
    query: { username: gallery.owner.username, galleryId: gallery.dbid },
  };

  const galleryEditLink: Route = useMemo(
    () => ({
      pathname: '/gallery/[galleryId]/edit',
      query: { galleryId: dbid },
    }),
    [dbid]
  );

  const handleEditGalleryClick = useCallback(() => {
    router.push(galleryEditLink);
  }, [galleryEditLink, router]);

  const handleChangeGalleryOrder = useCallback(
    (direction: GalleryOrderDirection) => {
      onGalleryOrderChange(gallery.dbid, direction);
    },
    [gallery.dbid, onGalleryOrderChange]
  );

  const nonNullTokenPreviews = removeNullValues(tokenPreviews?.map((token) => token?.large)) ?? [];

  const remainingTokenPreviews = TOTAL_TOKENS - nonNullTokenPreviews.length;

  if (!isAuthenticatedUser && hidden) return null;

  return (
    <StyledGalleryWrapper isDragging={isDragging}>
      <UnstyledLink href={isAuthenticatedUser && mode === 'edit' ? galleryEditLink : galleryLink}>
        <StyledGalleryDraggable
          gap={12}
          isAuthedUser={isAuthenticatedUser}
          style={style}
          {...attributes}
          {...listeners}
          ref={setNodeRef}
        >
          <HStack justify="space-between">
            <HStack shrink justify="space-between">
              <StyledGalleryTitleWrapper isHidden={hidden} align="center" gap={4}>
                {isAuthenticatedUser && (
                  <StyledIconContainer
                    isDragging={isDragging}
                    size="sm"
                    variant="stacked"
                    icon={<DragHandleIcon color={colors.black['800']} />}
                    onClick={(e) => e.preventDefault()}
                  />
                )}
                <TitleContainer>
                  <StyledGalleryTitle tabIndex={1}>{name || 'Untitled'}</StyledGalleryTitle>
                </TitleContainer>
              </StyledGalleryTitleWrapper>
            </HStack>

            <StyledGalleryActionsContainer>
              <HStack align="center" gap={2}>
                {isFeatured && (
                  <StyledGalleryFeaturedText as="span">Featured</StyledGalleryFeaturedText>
                )}
                {isAuthenticatedUser && (
                  <HStack>
                    <StyledEditGalleryLinkContainer href={galleryEditLink}>
                      <IconContainer
                        variant="stacked"
                        icon={<EditPencilIcon />}
                        tooltipLabel="Edit Gallery"
                        tooltipPlacement="left"
                      />
                    </StyledEditGalleryLinkContainer>
                    <SettingsDropdown iconVariant="stacked">
                      <DropdownSection>
                        <DropdownItem
                          onClick={handleEditGalleryClick}
                          name="Manage Gallery"
                          eventContext={contexts.Editor}
                          label="Edit Gallery"
                        />
                        {hidden ? (
                          <DropdownItem
                            onClick={handleUpdateGalleryHidden}
                            name="Manage Gallery"
                            eventContext={contexts.Editor}
                            label="Unhide"
                          />
                        ) : (
                          <>
                            {!isFeatured && (
                              <DropdownItem
                                onClick={handleSetFeaturedGallery}
                                name="Manage Gallery"
                                eventContext={contexts.Editor}
                                label="Feature on Profile"
                              />
                            )}
                            <DropdownItem
                              onClick={handleUpdateGalleryHidden}
                              name="Manage Gallery"
                              eventContext={contexts.Editor}
                              label="Hide"
                            />
                          </>
                        )}
                        <DropdownItem
                          onClick={handleDeleteGallery}
                          name="Manage Gallery"
                          eventContext={contexts.Editor}
                          label="Delete"
                          variant="delete"
                        />
                      </DropdownSection>
                    </SettingsDropdown>
                  </HStack>
                )}
              </HStack>
            </StyledGalleryActionsContainer>
          </HStack>

          <StyledTokenPreviewWrapper isHidden={hidden}>
            {nonNullTokenPreviews.map((token) => (
              <StyledTokenPreview key={token} src={token} />
            ))}
            {[...Array(remainingTokenPreviews).keys()].map((index) => (
              <StyledEmptyTokenPreview key={index} />
            ))}
          </StyledTokenPreviewWrapper>
        </StyledGalleryDraggable>
      </UnstyledLink>

      {isMobile && isAuthenticatedUser && (
        <StyledOrderingContainer>
          <StyledOrderingButton onClick={() => handleChangeGalleryOrder('up')}>
            <ArrowUpIcon />
          </StyledOrderingButton>
          <StyledOrderingButton onClick={() => handleChangeGalleryOrder('down')}>
            <ArrowDownIcon />
          </StyledOrderingButton>
        </StyledOrderingContainer>
      )}
    </StyledGalleryWrapper>
  );
}

const StyledGalleryWrapper = styled.div<{ isDragging?: boolean }>`
  position: relative;
  opacity: ${({ isDragging }) => (isDragging ? 0.5 : 1)};
`;

const StyledEditGalleryLinkContainer = styled(UnstyledLink)`
  display: none;
`;

const StyledGalleryFeaturedText = styled(TitleXS)`
  border: 1px solid ${colors.activeBlue};
  border-radius: 2px;
  padding: 2px 4px;
  color: ${colors.activeBlue};
  font-weight: 500;
`;

const StyledGalleryDraggable = styled(VStack)<{ isAuthedUser: boolean }>`
  border-radius: 12px;
  background-color: ${colors.offWhite};
  padding: 12px;

  &:hover {
    background-color: ${colors.faint};

    ${StyledEditGalleryLinkContainer} {
      display: block;
    }

    ${StyledGalleryFeaturedText} {
      ${({ isAuthedUser }) => isAuthedUser && `display:none`}
    }
  }
`;

const StyledGalleryTitleWrapper = styled(HStack)<{ isHidden?: boolean }>`
  opacity: ${({ isHidden = false }) => (isHidden ? 0.5 : 1)};
  overflow: hidden;
`;

const TitleContainer = styled(VStack)`
  overflow: hidden;
`;

const StyledGalleryTitle = styled(TitleS)`
  cursor: pointer;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledTokenPreviewWrapper = styled.div<{ isHidden?: boolean }>`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2px;
  opacity: ${({ isHidden }) => (isHidden ? 0.5 : 1)};
`;
const StyledTokenPreview = styled.img`
  height: auto;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
`;

const StyledEmptyTokenPreview = styled.div`
  height: 100%;
  width: 100%;
  aspect-ratio: 1 / 1;
`;

const StyledGalleryActionsContainer = styled.div`
  flex-shrink: 0;
  user-select: none;
  z-index: 10;
`;

const StyledIconContainer = styled(IconContainer)<{ isDragging: boolean }>`
  user-select: none;
  cursor: ${({ isDragging }) => (isDragging ? 'grabbing' : 'grab')};
`;

const StyledOrderingContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;

  border: 1px solid ${colors.faint};
`;

const StyledOrderingButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 10px;
  margin: 0;
  outline: none;

  &:last-child {
    border-left: 1px solid ${colors.faint};
  }
`;
