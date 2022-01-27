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

  const unescapedCollectorsNote = useMemo(() => unescape(collection.collectors_note || ''), [
    collection.collectors_note,
  ]);

  const authenticatedUserIsOnTheirOwnPage = username === user?.username;

  const collectionUrl = window.location.href;

  const isMobileScreen = screenWidth === size.mobile && collection && collection.nfts?.length > 0;

  const handleGalleryRedirect = useCallback(() => {
    void push(`/${username}`);
  }, [push, username]);

  const handleEditCollectionClick = useCallback(() => {
    Mixpanel.track('Update existing collection');
    void push(`/edit?collectionId=${collection.id}`);
  }, [collection.id]);

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
    <StyledCollectionGalleryHeader>
      <StyledHeaderWrapper>
        <Subdisplay>
          <StyledUsername onClick={handleGalleryRedirect}>{username}</StyledUsername> /{' '}
          {collection.name}
        </Subdisplay>
        {isMobileScreen && (
          <MobileLayoutToggle mobileLayout={mobileLayout} setMobileLayout={setMobileLayout} />
        )}
      </StyledHeaderWrapper>
      <Spacer height={8} />
      <StyledCollectionDetails>
        {unescapedCollectorsNote && (
          <StyledCollectionNote color={colors.gray50}>
            <Markdown text={unescapedCollectorsNote} />
          </StyledCollectionNote>
        )}
        <Spacer height={60} />
        <StyledCollectionActions>
          {authenticatedUserIsOnTheirOwnPage && (
            <>
              <NavElement>
                <TextButton onClick={handleEditNameClick} text="EDIT NAME & DESCRIPTION" />
              </NavElement>
              {!isMobileScreen && (
                <>
                  <Spacer width={12} />
                  <NavElement>
                    <TextButton onClick={handleEditCollectionClick} text="Edit Collection" />
                  </NavElement>
                </>
              )}
              <Spacer width={12} />
            </>
          )}
          <NavElement>
            <CopyToClipboard textToCopy={collectionUrl}>
              <TextButton text="Share" />
            </CopyToClipboard>
          </NavElement>
        </StyledCollectionActions>
      </StyledCollectionDetails>
    </StyledCollectionGalleryHeader>
  );
}

const StyledCollectionGalleryHeader = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
`;

const StyledUsername = styled.span`
  cursor: pointer;
  color: ${colors.gray40};
  &:hover {
    color: ${colors.gray80};
  }
`;

const StyledHeaderWrapper = styled(Subdisplay)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledCollectionDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: start;
  word-break: break-word;

  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
  }
`;

const StyledCollectionNote = styled(BodyRegular)`
  /* ensures linebreaks are reflected in UI */
  white-space: pre-line;
`;

const StyledCollectionActions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 100%;
`;

export default CollectionGalleryHeader;
