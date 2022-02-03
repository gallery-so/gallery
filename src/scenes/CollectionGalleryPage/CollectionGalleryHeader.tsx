import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import unescape from 'lodash.unescape';
import { Subdisplay, BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import Markdown from 'components/core/Markdown/Markdown';
import NavElement from 'components/core/Page/GlobalNavbar/NavElement';
import TextButton from 'components/core/Button/TextButton';
import breakpoints, { size } from 'components/core/breakpoints';
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard';
import { Collection } from 'types/Collection';
import { useRouter } from 'next/router';
import { useModal } from 'contexts/modal/ModalContext';
import CollectionCreateOrEditForm from 'flows/shared/steps/OrganizeCollection/CollectionCreateOrEditForm';
import noop from 'utils/noop';
import Mixpanel from 'utils/mixpanel';
import { usePossiblyAuthenticatedUser } from 'hooks/api/users/useUser';
import MobileLayoutToggle from 'scenes/UserGalleryPage/MobileLayoutToggle';
import { useBreakpoint } from 'hooks/useWindowSize';
import { DisplayLayout } from 'components/core/enums';
import useBackButton from 'hooks/useBackButton';
import { StyledDropdownButton } from 'components/core/Dropdown/Dropdown';
import SettingsDropdown from 'components/core/Dropdown/SettingsDropdown';

type Props = {
  collection: Collection;
  mobileLayout: DisplayLayout;
  setMobileLayout: (mobileLayout: DisplayLayout) => void;
};

function CollectionGalleryHeader({ collection, mobileLayout, setMobileLayout }: Props) {
  const { showModal } = useModal();
  const { push } = useRouter();
  const screenWidth = useBreakpoint();
  const user = usePossiblyAuthenticatedUser();
  const username = useMemo(() => window.location.pathname.split('/')[1], []);
  const handleBackClick = useBackButton({ username });

  const unescapedCollectionName = useMemo(() => unescape(collection.name), [collection.name]);
  const unescapedCollectorsNote = useMemo(
    () => unescape(collection.collectors_note || ''),
    [collection.collectors_note]
  );

  const authenticatedUserIsOnTheirOwnPage = username.toLowerCase() === user?.username.toLowerCase();

  const collectionUrl = window.location.href;

  const isMobileScreen = screenWidth === size.mobile && collection && collection.nfts?.length > 0;

  const handleEditCollectionClick = useCallback(() => {
    Mixpanel.track('Update existing collection');
    void push(`/edit?collectionId=${collection.id}`);
  }, [collection.id, push]);

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
          <StyledUsername onClick={handleBackClick}>{username}</StyledUsername>
          {collection.name && <StyledSeparator>/</StyledSeparator>}
          {isMobileScreen && (
            <MobileLayoutToggle mobileLayout={mobileLayout} setMobileLayout={setMobileLayout} />
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
        {authenticatedUserIsOnTheirOwnPage ? (
          <SettingsDropdown>
            <TextButton
              onClick={handleEditNameClick}
              text="EDIT NAME & DESCRIPTION"
              underlineOnHover
            />
            {!isMobileScreen && (
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
              <TextButton text="Share" underlineOnHover />
            </CopyToClipboard>
          </SettingsDropdown>
        ) : (
          <CopyToClipboard textToCopy={collectionUrl}>
            <TextButton text="Share" />
          </CopyToClipboard>
        )}
      </StyledCollectionActions>
    </StyledCollectionGalleryHeaderWrapper>
  );
}

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
`;

const StyledUsernameWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const StyledCollectionName = styled.div``;

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

// const SettingWrapper = styled.div<{ isHover: boolean }>`
//   position: relative;
//   opacity: ${({ isHover }) => (isHover ? '1' : '0')};
//   transition: opacity 200ms ease-in-out;
// `;

const DropdownWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  ${StyledDropdownButton} {
    width: 32px;
    height: 24px;
  }
`;

export default CollectionGalleryHeader;
