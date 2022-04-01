import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import unescape from 'utils/unescape';
import { Subdisplay, BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import Markdown from 'components/core/Markdown/Markdown';
import NavElement from 'components/core/Page/GlobalNavbar/NavElement';
import TextButton from 'components/core/Button/TextButton';
import breakpoints from 'components/core/breakpoints';
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard';
import { Collection } from 'types/Collection';
import { useRouter } from 'next/router';
import { useModal } from 'contexts/modal/ModalContext';
import CollectionCreateOrEditForm from 'flows/shared/steps/OrganizeCollection/CollectionCreateOrEditForm';
import noop from 'utils/noop';
import { usePossiblyAuthenticatedUser } from 'hooks/api/users/useUser';
import MobileLayoutToggle from 'scenes/UserGalleryPage/MobileLayoutToggle';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import { DisplayLayout } from 'components/core/enums';
import useBackButton from 'hooks/useBackButton';
import SettingsDropdown from 'components/core/Dropdown/SettingsDropdown';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import {
  __APRIL_FOOLS_HexToggleProps__,
  __APRIL_FOOLS__DesktopHexToggle__,
} from 'scenes/UserGalleryPage/__APRIL_FOOLS__DesktopHexToggle__';

type Props = {
  collection: Collection;
  mobileLayout: DisplayLayout;
  setMobileLayout: (mobileLayout: DisplayLayout) => void;
} & __APRIL_FOOLS_HexToggleProps__;

function CollectionGalleryHeader({
  collection,
  mobileLayout,
  setMobileLayout,
  __APRIL_FOOLS__hexEnabled__,
  __APRIL_FOOLS__setHexEnabled__,
}: Props) {
  const { showModal } = useModal();
  const { push } = useRouter();
  const user = usePossiblyAuthenticatedUser();
  const username = useMemo(() => window.location.pathname.split('/')[1], []);
  const handleBackClick = useBackButton({ username });

  const unescapedCollectionName = useMemo(() => unescape(collection.name), [collection.name]);
  const unescapedCollectorsNote = useMemo(
    () => unescape(collection.collectors_note || ''),
    [collection.collectors_note]
  );

  const track = useTrack();

  const handleShareClick = useCallback(() => {
    track('Share Collection', { path: `/${username}/${collection.id}` });
  }, [collection.id, username, track]);

  const showEditActions = username.toLowerCase() === user?.username.toLowerCase();

  const collectionUrl = window.location.href;

  const isMobile = useIsMobileWindowWidth();
  const shouldDisplayMobileLayoutToggle = isMobile && collection?.nfts?.length > 0;

  const handleEditCollectionClick = useCallback(() => {
    track('Update existing collection');
    void push(`/edit?collectionId=${collection.id}`);
  }, [collection.id, push, track]);

  const handleEditNameClick = useCallback(() => {
    showModal(
      <CollectionCreateOrEditForm
        // No need for onNext because this isn't part of a wizard
        onNext={noop}
        collectionId={collection.id}
        collectionName={collection.name}
        collectionCollectorsNote={collection.collectors_note}
      />
    );
  }, [collection.collectors_note, collection.id, collection.name, showModal]);

  return (
    <StyledCollectionGalleryHeaderWrapper>
      <StyledHeaderWrapper>
        <StyledUsernameWrapper>
          <StyledUsernameAndSeparatorWrapper>
            <StyledUsername onClick={handleBackClick}>{username}</StyledUsername>
            {collection.name && <StyledSeparator>/</StyledSeparator>}
          </StyledUsernameAndSeparatorWrapper>
          {shouldDisplayMobileLayoutToggle ? (
            <MobileLayoutToggle mobileLayout={mobileLayout} setMobileLayout={setMobileLayout} />
          ) : (
            <__STYLED__APRIL_FOOLS__DesktopHexToggle__
              __APRIL_FOOLS__hexEnabled__={__APRIL_FOOLS__hexEnabled__}
              __APRIL_FOOLS__setHexEnabled__={__APRIL_FOOLS__setHexEnabled__}
            />
          )}
        </StyledUsernameWrapper>
        <StyledCollectionName>{unescapedCollectionName}</StyledCollectionName>
      </StyledHeaderWrapper>
      <Spacer height={32} />
      {unescapedCollectorsNote && (
        <StyledCollectionNote color={colors.gray50}>
          <Markdown text={unescapedCollectorsNote} />
        </StyledCollectionNote>
      )}
      <Spacer height={60} />
      <StyledCollectionActions>
        {showEditActions ? (
          <SettingsDropdown>
            <TextButton
              onClick={handleEditNameClick}
              text="EDIT NAME & DESCRIPTION"
              underlineOnHover
            />
            {!shouldDisplayMobileLayoutToggle && (
              <>
                <Spacer height={8} />
                <NavElement>
                  <TextButton
                    onClick={handleEditCollectionClick}
                    text="Edit Collection"
                    underlineOnHover
                  />
                </NavElement>
              </>
            )}
            <Spacer height={8} />
            <CopyToClipboard textToCopy={collectionUrl}>
              <TextButton text="Share" underlineOnHover onClick={handleShareClick} />
            </CopyToClipboard>
          </SettingsDropdown>
        ) : (
          <CopyToClipboard textToCopy={collectionUrl}>
            <TextButton text="Share" onClick={handleShareClick} />
          </CopyToClipboard>
        )}
      </StyledCollectionActions>
    </StyledCollectionGalleryHeaderWrapper>
  );
}

const __STYLED__APRIL_FOOLS__DesktopHexToggle__ = styled(__APRIL_FOOLS__DesktopHexToggle__)`
  position: absolute;
  right: 0;
`;

const StyledCollectionGalleryHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
`;

const StyledHeaderWrapper = styled(Subdisplay)`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
  }

  position: relative;
`;

const StyledUsernameWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const StyledUsernameAndSeparatorWrapper = styled.div`
  display: flex;
`;

const StyledCollectionName = styled.div`
  word-break: break-word;
`;

const StyledSeparator = styled.div`
  margin: 0 10px;
  display: none;
  color: ${colors.gray40};

  @media only screen and ${breakpoints.mobileLarge} {
    display: block;
  }
`;

const StyledUsername = styled.span`
  cursor: pointer;
  color: ${colors.gray40};
  display: flex;
  &:hover {
    color: ${colors.gray80};
  }
`;

const StyledCollectionNote = styled(BodyRegular)`
  width: 100%;
  word-break: break-word;
  /* ensures linebreaks are reflected in UI */
  white-space: pre-line;

  @media only screen and ${breakpoints.tablet} {
    width: 70%;
  }
`;

const StyledCollectionActions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 100%;

  @media only screen and ${breakpoints.tablet} {
    width: auto;
  }
`;

export default CollectionGalleryHeader;
