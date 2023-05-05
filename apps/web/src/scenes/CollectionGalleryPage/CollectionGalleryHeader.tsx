import { route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import CopyToClipboard from '~/components/CopyToClipboard/CopyToClipboard';
import breakpoints from '~/components/core/breakpoints';
import TextButton from '~/components/core/Button/TextButton';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownLink } from '~/components/core/Dropdown/DropdownLink';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import SettingsDropdown from '~/components/core/Dropdown/SettingsDropdown';
import { DisplayLayout } from '~/components/core/enums';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleL } from '~/components/core/Text/Text';
import { CollectionCreateOrEditForm } from '~/components/GalleryEditor/CollectionCreateOrEditForm';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { CollectionGalleryHeaderFragment$key } from '~/generated/CollectionGalleryHeaderFragment.graphql';
import { CollectionGalleryHeaderQueryFragment$key } from '~/generated/CollectionGalleryHeaderQueryFragment.graphql';
import useUpdateCollectionInfo from '~/hooks/api/collections/useUpdateCollectionInfo';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import MobileLayoutToggle from '~/scenes/UserGalleryPage/MobileLayoutToggle';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import unescape from '~/shared/utils/unescape';

type Props = {
  queryRef: CollectionGalleryHeaderQueryFragment$key;
  collectionRef: CollectionGalleryHeaderFragment$key;
  mobileLayout: DisplayLayout;
  setMobileLayout: (mobileLayout: DisplayLayout) => void;
};

function CollectionGalleryHeader({
  queryRef,
  collectionRef,
  mobileLayout,
  setMobileLayout,
}: Props) {
  const { showModal } = useModalActions();

  const query = useFragment(
    graphql`
      fragment CollectionGalleryHeaderQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              username
            }
          }
        }
      }
    `,
    queryRef
  );

  const collection = useFragment(
    graphql`
      fragment CollectionGalleryHeaderFragment on Collection {
        dbid
        name
        collectorsNote
        gallery @required(action: THROW) {
          dbid
          owner {
            username
          }
        }

        tokens {
          __typename
        }
      }
    `,
    collectionRef
  );

  const username = collection.gallery.owner?.username;

  const unescapedCollectionName = useMemo(
    () => (collection.name ? unescape(collection.name) : null),
    [collection.name]
  );
  const unescapedCollectorsNote = useMemo(
    () => (collection.collectorsNote ? unescape(collection.collectorsNote || '') : null),
    [collection.collectorsNote]
  );

  const track = useTrack();

  const {
    dbid: collectionId,
    gallery: { dbid: galleryId },
  } = collection;

  const handleShareClick = useCallback(() => {
    track('Share Collection', {
      path: route({
        pathname: '/[username]/[collectionId]',
        query: { username: username as string, collectionId },
      }),
    });
  }, [collectionId, username, track]);

  const showEditActions = username?.toLowerCase() === query.viewer?.user?.username?.toLowerCase();

  const collectionUrl = window.location.href;

  const isMobile = useIsMobileOrMobileLargeWindowWidth();
  const shouldDisplayMobileLayoutToggle = isMobile && (collection?.tokens?.length ?? 0) > 1;

  const [updateCollectionInfo] = useUpdateCollectionInfo();
  const handleEditNameClick = useCallback(() => {
    showModal({
      content: (
        <CollectionCreateOrEditForm
          mode="editing"
          onDone={async ({ name, collectorsNote }) => {
            await updateCollectionInfo(collection.dbid, name, collectorsNote);
          }}
          name={collection.name ?? undefined}
          collectorsNote={collection.collectorsNote ?? undefined}
        />
      ),
      headerText: 'Name and describe your collection',
    });
  }, [
    collection.collectorsNote,
    collection.dbid,
    collection.name,
    showModal,
    updateCollectionInfo,
  ]);

  if (isMobile) {
    return (
      <StyledCollectionGalleryHeaderWrapper>
        <HStack align="flex-start" justify="space-between">
          {unescapedCollectorsNote ? (
            <StyledCollectionNote>
              <Markdown text={unescapedCollectorsNote} />
            </StyledCollectionNote>
          ) : (
            <div />
          )}

          {shouldDisplayMobileLayoutToggle && (
            <StyledMobileLayoutToggleContainer>
              <MobileLayoutToggle mobileLayout={mobileLayout} setMobileLayout={setMobileLayout} />
            </StyledMobileLayoutToggleContainer>
          )}
        </HStack>
      </StyledCollectionGalleryHeaderWrapper>
    );
  }

  return (
    <StyledCollectionGalleryHeaderWrapper>
      <HStack align="flex-start" justify="space-between">
        <VStack grow>
          <StyledBreadcrumbsWrapper>
            <StyledCollectionName>{unescapedCollectionName}</StyledCollectionName>
          </StyledBreadcrumbsWrapper>
          {unescapedCollectorsNote && (
            <StyledCollectionNote clamp={2}>
              <Markdown text={unescapedCollectorsNote} />
            </StyledCollectionNote>
          )}
        </VStack>

        <StyledCollectionActions align="center" justify="flex-end">
          {showEditActions ? (
            <>
              <CopyToClipboard textToCopy={collectionUrl}>
                <TextButton text="Share" onClick={handleShareClick} />
              </CopyToClipboard>

              {/* On mobile, we show these options in the navbar, not in header */}
              <SettingsDropdown iconVariant="default">
                <DropdownSection>
                  <DropdownItem onClick={handleEditNameClick}>EDIT NAME & DESCRIPTION</DropdownItem>

                  {!shouldDisplayMobileLayoutToggle && (
                    <DropdownLink
                      href={{
                        pathname: '/gallery/[galleryId]/edit',
                        query: { galleryId, collectionId },
                      }}
                      onClick={() => {
                        track('Update existing collection');
                      }}
                    >
                      EDIT COLLECTION
                    </DropdownLink>
                  )}
                </DropdownSection>
              </SettingsDropdown>
            </>
          ) : (
            <CopyToClipboard textToCopy={collectionUrl}>
              <TextButton text="Share" onClick={handleShareClick} />
            </CopyToClipboard>
          )}
        </StyledCollectionActions>
      </HStack>
    </StyledCollectionGalleryHeaderWrapper>
  );
}

const StyledCollectionGalleryHeaderWrapper = styled(VStack)`
  width: 100%;
`;

const BreadcrumbsWrapperWidth = 80;

const StyledBreadcrumbsWrapper = styled(VStack)`
  max-width: calc(100% - ${BreadcrumbsWrapperWidth}px);
  @media only screen and ${breakpoints.mobileLarge} {
    flex-direction: row;
  }
`;

const StyledCollectionName = styled(TitleL)`
  word-break: break-word;
`;

const StyledCollectionNote = styled(BaseM)<{ clamp?: number }>`
  width: 100%;
  word-break: break-word;

  @media only screen and ${breakpoints.tablet} {
    width: 70%;
    padding-top: 16px;
  }
`;

const StyledCollectionActions = styled(HStack)`
  width: ${BreadcrumbsWrapperWidth}px;
`;

const StyledMobileLayoutToggleContainer = styled.div`
  padding-left: 8px;
`;

export default CollectionGalleryHeader;
