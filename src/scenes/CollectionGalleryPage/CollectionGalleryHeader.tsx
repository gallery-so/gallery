import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import unescape from 'lodash.unescape';
import { Subdisplay, BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import Markdown from 'components/core/Markdown/Markdown';
import NavElement from 'components/core/Page/GlobalNavbar/NavElement';
import TextButton from 'components/core/Button/TextButton';
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard';
import { Collection } from 'types/Collection';
import { useRouter } from 'next/router';
import { useModal } from 'contexts/modal/ModalContext';
import CollectionCreateOrEditForm from 'flows/shared/steps/OrganizeCollection/CollectionCreateOrEditForm';
import noop from 'utils/noop';

type Props = {
  collection: Collection;
};

function CollectionGalleryHeader({ collection }: Props) {
  const { showModal } = useModal();
  const { push } = useRouter();

  const username = window.location.pathname.split('/')[1];

  const unescapedCollectorsNote = useMemo(() => unescape(collection.collectors_note || ''), [
    collection.collectors_note,
  ]);

  const collectionUrl = window.location.href;

  const handleGalleryRedirect = useCallback(() => {
    void push(`/${username}`);
  }, [push, username]);

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
      <Subdisplay>
        <StyledUsername onClick={handleGalleryRedirect}>{username}</StyledUsername> /{' '}
        {collection.name}
      </Subdisplay>
      <Spacer height={8} />
      <StyledCollectionDetails>
        {unescapedCollectorsNote && (
          <StyledCollectionNote color={colors.gray50}>
            <Markdown text={unescapedCollectorsNote} />
          </StyledCollectionNote>
        )}
        <StyledCollectionActions>
          <>
            <NavElement>
              <TextButton onClick={handleEditNameClick} text="EDIT NAME & DESCRIPTION" />
            </NavElement>
            <Spacer width={12} />
            <NavElement>
              <TextButton text="Edit Collection" />
            </NavElement>
            <Spacer width={12} />
          </>
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

const StyledCollectionDetails = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  word-break: break-word;
`;

const StyledCollectionNote = styled(BodyRegular)`
  /* ensures linebreaks are reflected in UI */
  white-space: pre-line;
`;

const StyledCollectionActions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export default CollectionGalleryHeader;
