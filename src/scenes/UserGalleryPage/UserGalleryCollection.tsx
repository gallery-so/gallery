import { useRouter } from 'next/router';
import { Route, route } from 'nextjs-routes';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled, { css } from 'styled-components';

import CopyToClipboard from '~/components/CopyToClipboard/CopyToClipboard';
import breakpoints from '~/components/core/breakpoints';
import TextButton from '~/components/core/Button/TextButton';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownLink } from '~/components/core/Dropdown/DropdownLink';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import SettingsDropdown from '~/components/core/Dropdown/SettingsDropdown';
import { DisplayLayout } from '~/components/core/enums';
import { UnstyledLink } from '~/components/core/Link/UnstyledLink';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleS } from '~/components/core/Text/Text';
import CollectionCreateOrEditForm from '~/components/ManageGallery/OrganizeCollection/CollectionCreateOrEditForm';
import NftGallery from '~/components/NftGallery/NftGallery';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { UserGalleryCollectionFragment$key } from '~/generated/UserGalleryCollectionFragment.graphql';
import { UserGalleryCollectionQueryFragment$key } from '~/generated/UserGalleryCollectionQueryFragment.graphql';
import { useLoggedInUserId } from '~/hooks/useLoggedInUserId';
import useResizeObserver from '~/hooks/useResizeObserver';
import { baseUrl } from '~/utils/baseUrl';
import noop from '~/utils/noop';
import unescape from '~/utils/unescape';

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
  const collectionUrlPath: Route = {
    pathname: '/[username]/[collectionId]',
    query: { username, collectionId },
  };
  const collectionUrl = route(collectionUrlPath);

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
          <UnstyledLink href={collectionUrlPath}>
            <StyledCollectorsTitle>{unescapedCollectionName}</StyledCollectorsTitle>
          </UnstyledLink>
          <StyledOptionsContainer gap={16}>
            <StyledCopyToClipboard textToCopy={`${baseUrl}${collectionUrl}`}>
              <TextButton text="Share" onClick={handleShareClick} />
            </StyledCopyToClipboard>
            <SettingsDropdown>
              <DropdownSection>
                {showEditActions && (
                  <>
                    <DropdownItem onClick={handleEditNameClick}>
                      EDIT NAME & DESCRIPTION
                    </DropdownItem>
                    <DropdownLink
                      href={{
                        pathname: '/gallery/[galleryId]/collection/[collectionId]/edit',
                        query: { galleryId, collectionId },
                      }}
                      onClick={() => track('Update existing collection button clicked')}
                    >
                      EDIT COLLECTION
                    </DropdownLink>
                  </>
                )}
                <DropdownLink href={collectionUrlPath}>VIEW COLLECTION</DropdownLink>
              </DropdownSection>
            </SettingsDropdown>
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

const StyledCopyToClipboard = styled(CopyToClipboard)`
  height: 24px !important;
`;

const StyledOptionsContainer = styled(HStack)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 24px;

  transition: opacity 200ms ease-in-out;
  opacity: 0;
`;

const StyledCollectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;

  &:hover ${StyledOptionsContainer} {
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
          @media only screen and ${breakpoints.tablet} {
            -webkit-line-clamp: unset;
          }

          -webkit-line-clamp: 2;

          p {
            padding-bottom: 0 !important;
          }
        `}
`;

export default UserGalleryCollection;
