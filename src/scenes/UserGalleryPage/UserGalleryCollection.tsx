import styled, { css } from 'styled-components';
import unescape from 'utils/unescape';
import { BaseM, TitleS } from 'components/core/Text/Text';
import breakpoints from 'components/core/breakpoints';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Markdown from 'components/core/Markdown/Markdown';
import { DisplayLayout } from 'components/core/enums';
import NftGallery from 'components/NftGallery/NftGallery';
import TextButton from 'components/core/Button/TextButton';
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard';
import Dropdown, { StyledDropdownButton } from 'components/core/Dropdown/Dropdown';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { useRouter } from 'next/router';
import { baseUrl } from 'utils/baseUrl';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useLoggedInUserId } from 'hooks/useLoggedInUserId';
import { UserGalleryCollectionFragment$key } from '__generated__/UserGalleryCollectionFragment.graphql';
import { UserGalleryCollectionQueryFragment$key } from '__generated__/UserGalleryCollectionQueryFragment.graphql';
import noop from 'utils/noop';
import { useModalActions } from 'contexts/modal/ModalContext';
import { UnstyledLink } from 'components/core/Link/UnstyledLink';
import useResizeObserver from 'hooks/useResizeObserver';
import { HStack, VStack } from 'components/core/Spacer/Stack';
import CollectionCreateOrEditForm from 'components/ManageGallery/OrganizeCollection/CollectionCreateOrEditForm';

type Props = {
  queryRef: UserGalleryCollectionQueryFragment$key;
  collectionRef: UserGalleryCollectionFragment$key;
  mobileLayout: DisplayLayout;
  cacheHeight: number;
  onLoad: () => void;
  onLayoutShift: () => void;
};

function UserGalleryCollection({
  queryRef,
  collectionRef,
  mobileLayout,
  onLoad,
  cacheHeight,
  onLayoutShift,
}: Props) {
  const query = useFragment(
    graphql`
      fragment UserGalleryCollectionQueryFragment on Query {
        ...useLoggedInUserIdFragment
      }
    `,
    queryRef
  );

  const collection = useFragment(
    graphql`
      fragment UserGalleryCollectionFragment on Collection {
        dbid
        name @required(action: THROW)
        collectorsNote

        gallery @required(action: THROW) {
          dbid @required(action: THROW)
          owner @required(action: THROW) {
            id @required(action: THROW)
          }
        }

        ...NftGalleryFragment
      }
    `,
    collectionRef
  );

  const loggedInUserId = useLoggedInUserId(query);
  const showEditActions = loggedInUserId === collection.gallery.owner.id;
  const {
    dbid: collectionId,
    gallery: { dbid: galleryId },
  } = collection;

  const { showModal } = useModalActions();
  const router = useRouter();

  const unescapedCollectionName = useMemo(() => unescape(collection.name), [collection.name]);
  const unescapedCollectorsNote = useMemo(
    () => unescape(collection.collectorsNote ?? ''),
    [collection.collectorsNote]
  );

  const username = router.query.username as string;
  const collectionUrl = `/${username}/${collectionId}`;

  const track = useTrack();

  // Get height of this component
  const componentRef = useRef<HTMLDivElement>(null);
  const { height: collectionElHeight } = useResizeObserver(componentRef);

  useEffect(() => {
    // If the latest height is greater than the cache height, then we know that the collection has been expanded.
    if (collectionElHeight > cacheHeight) {
      onLoad();
    }
  }, [collectionElHeight, onLoad, cacheHeight]);

  const handleShareClick = useCallback(() => {
    track('Share Collection', { path: collectionUrl });
  }, [track, collectionUrl]);

  const handleEditNameClick = useCallback(() => {
    showModal({
      content: (
        <CollectionCreateOrEditForm
          // No need for onNext because this isn't part of a wizard
          onNext={noop}
          galleryId={galleryId}
          collectionId={collectionId}
          collectionName={collection.name}
          collectionCollectorsNote={collection.collectorsNote ?? ''}
        />
      ),
      headerText: 'Name and describe your collection',
    });
  }, [collection.collectorsNote, collectionId, collection.name, galleryId, showModal]);

  const [showMore, setShowMore] = useState(false);
  const handleCollectorsNoteClick = useCallback(() => {
    setShowMore((previous) => !previous);

    onLayoutShift();
  }, [onLayoutShift]);

  return (
    <StyledCollectionWrapper ref={componentRef}>
      <StyledCollectionHeader>
        <StyledCollectionTitleWrapper>
          <UnstyledLink href={collectionUrl}>
            <StyledCollectorsTitle>{unescapedCollectionName}</StyledCollectorsTitle>
          </UnstyledLink>
          <StyledOptionsContainer gap={16}>
            <StyledCopyToClipboard textToCopy={`${baseUrl}${collectionUrl}`}>
              <StyledShareButton text="Share" onClick={handleShareClick} />
            </StyledCopyToClipboard>
            <StyledSettingsDropdown>
              <Dropdown>
                <VStack gap={8}>
                  {showEditActions && (
                    <>
                      <TextButton
                        onClick={handleEditNameClick}
                        text="EDIT NAME & DESCRIPTION"
                        underlineOnHover
                      />
                      <UnstyledLink
                        href={`/gallery/${galleryId}/collection/${collectionId}/edit`}
                        onClick={() => track('Update existing collection button clicked')}
                      >
                        <TextButton text="Edit Collection" underlineOnHover />
                      </UnstyledLink>
                    </>
                  )}
                  <UnstyledLink href={collectionUrl}>
                    <TextButton text="View Collection" underlineOnHover />
                  </UnstyledLink>
                </VStack>
              </Dropdown>
            </StyledSettingsDropdown>
          </StyledOptionsContainer>
        </StyledCollectionTitleWrapper>
        {unescapedCollectorsNote && (
          <>
            <StyledCollectorsNote showMore={showMore} onClick={handleCollectorsNoteClick}>
              <Markdown text={unescapedCollectorsNote} />
            </StyledCollectorsNote>
          </>
        )}
      </StyledCollectionHeader>
      <NftGallery collectionRef={collection} mobileLayout={mobileLayout} />
    </StyledCollectionWrapper>
  );
}

const StyledSettingsDropdown = styled.div`
  opacity: 0;
  transition: opacity 200ms ease-in-out;

  background: url(/icons/ellipses.svg) no-repeat scroll 10px 9px;
  background-position: center;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${StyledDropdownButton} {
    width: 16px;
    height: 16px;
  }
`;

const StyledShareButton = styled(TextButton)`
  opacity: 0;
  transition: opacity 200ms ease-in-out;
`;

const StyledCopyToClipboard = styled(CopyToClipboard)`
  height: 24px !important;
`;

const StyledCollectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;

  &:hover ${StyledSettingsDropdown}, &:hover ${StyledShareButton} {
    opacity: 1;
  }
`;

const StyledCollectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  // to appear above content underneath
  z-index: 1;
  margin-bottom: 16px;

  @media only screen and ${breakpoints.tablet} {
    margin-bottom: 24px;
  }
`;

const StyledCollectionTitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  word-break: break-word;
`;

const StyledCollectorsTitle = styled(TitleS)`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const StyledCollectorsNote = styled(BaseM)<{ showMore: boolean }>`
  width: 100%;

  @media only screen and ${breakpoints.mobileLarge} {
    width: 70%;
  }

  @media only screen and ${breakpoints.tablet} {
    width: 70%;
  }

  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;

  ${({ showMore }) =>
    showMore
      ? css`
          -webkit-line-clamp: unset;
        `
      : css`
          // We only care about line clamping on mobile
          @media only screen and ${breakpoints.mobileLarge} {
            -webkit-line-clamp: unset;
          }

          -webkit-line-clamp: 2;

          p {
            padding-bottom: 0 !important;
          }
        `}
`;

const StyledOptionsContainer = styled(HStack)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 24px;
`;

export default UserGalleryCollection;
