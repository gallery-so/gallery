import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import unescape from 'utils/unescape';
import { BaseM, TitleL } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Markdown from 'components/core/Markdown/Markdown';
import NavElement from 'contexts/globalLayout/GlobalNavbar/NavElement';
import TextButton from 'components/core/Button/TextButton';
import breakpoints from 'components/core/breakpoints';
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard';
import { useModalActions } from 'contexts/modal/ModalContext';
import noop from 'utils/noop';
import MobileLayoutToggle from 'scenes/UserGalleryPage/MobileLayoutToggle';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { DisplayLayout } from 'components/core/enums';
import SettingsDropdown from 'components/core/Dropdown/SettingsDropdown';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { graphql, useFragment } from 'react-relay';

import { CollectionGalleryHeaderFragment$key } from '__generated__/CollectionGalleryHeaderFragment.graphql';
import { CollectionGalleryHeaderQueryFragment$key } from '__generated__/CollectionGalleryHeaderQueryFragment.graphql';
import { UnstyledLink } from 'components/core/Link/UnstyledLink';
import { HStack, VStack } from 'components/core/Spacer/Stack';
import CollectionCreateOrEditForm from 'components/ManageGallery/OrganizeCollection/CollectionCreateOrEditForm';

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
    track('Share Collection', { path: `/${username}/${collectionId}` });
  }, [collectionId, username, track]);

  const showEditActions = username?.toLowerCase() === query.viewer?.user?.username?.toLowerCase();

  const collectionUrl = window.location.href;

  const isMobile = useIsMobileOrMobileLargeWindowWidth();
  const shouldDisplayMobileLayoutToggle = isMobile && (collection?.tokens?.length ?? 0) > 1;

  const handleEditNameClick = useCallback(() => {
    showModal({
      content: (
        <CollectionCreateOrEditForm
          // No need for onNext because this isn't part of a wizard
          onNext={noop}
          galleryId={galleryId}
          collectionId={collectionId}
          collectionName={collection.name ?? undefined}
          collectionCollectorsNote={collection.collectorsNote ?? undefined}
        />
      ),
      headerText: 'Name and describe your collection',
    });
  }, [collection.collectorsNote, collectionId, galleryId, collection.name, showModal]);

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
            <HStack align="flex-start" justify="space-between">
              <HStack>
                {username ? (
                  <UnstyledLink href={`/${username}`}>
                    <StyledUsername>{username}</StyledUsername>
                  </UnstyledLink>
                ) : null}
                {username && collection.name ? <StyledSeparator>/</StyledSeparator> : null}
              </HStack>
            </HStack>
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
              <SettingsDropdown>
                <TextButton onClick={handleEditNameClick} text="EDIT NAME & DESCRIPTION" />
                {!shouldDisplayMobileLayoutToggle && (
                  <>
                    <NavElement>
                      <UnstyledLink
                        href={`/gallery/${galleryId}/collection/${collectionId}/edit`}
                        onClick={() => track('Update existing collection')}
                      >
                        <TextButton text="Edit Collection" />
                      </UnstyledLink>
                    </NavElement>
                  </>
                )}
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

const StyledSeparator = styled(TitleL)`
  margin: 0 10px;
  display: block;
  color: ${colors.offBlack};
`;

const StyledUsername = styled(TitleL)`
  cursor: pointer;
  color: ${colors.metal};
  display: flex;
  &:hover {
    color: ${colors.shadow};
  }
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
