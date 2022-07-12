import { useState, useCallback, useMemo } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import unescape from 'utils/unescape';

import BigInput from 'components/core/BigInput/BigInput';
import Spacer from 'components/core/Spacer/Spacer';
import { Button } from 'components/core/Button/Button';
import { TextAreaWithCharCount } from 'components/core/TextArea/TextArea';
import ErrorText from 'components/core/Text/ErrorText';
import { useModalActions } from 'contexts/modal/ModalContext';
import formatError from 'errors/formatError';
import useUpdateCollectionInfo from 'hooks/api/collections/useUpdateCollectionInfo';
import useCreateCollection from 'hooks/api/collections/useCreateCollection';
import { StagingItem } from './types';
import { removeWhitespacesFromStagedItems } from 'utils/collectionLayout';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import breakpoints from 'components/core/breakpoints';

type Props = {
  onNext: WizardContext['next'];
  galleryId: string;
  collectionId?: string;
  collectionName?: string;
  collectionCollectorsNote?: string;
  stagedItems?: StagingItem[];
  layout?: {
    columns: number;
    whitespace: readonly number[];
  };
};

export const COLLECTION_DESCRIPTION_MAX_CHAR_COUNT = 600;

function CollectionCreateOrEditForm({
  onNext,
  galleryId,
  collectionId,
  collectionName,
  collectionCollectorsNote,
  stagedItems,
  layout,
}: Props) {
  const { hideModal } = useModalActions();

  const unescapedCollectionName = useMemo(() => unescape(collectionName), [collectionName]);
  const unescapedCollectorsNote = useMemo(
    () => unescape(collectionCollectorsNote),
    [collectionCollectorsNote]
  );

  const [title, setTitle] = useState(unescapedCollectionName ?? '');
  const [description, setDescription] = useState(unescapedCollectorsNote ?? '');

  // Generic error that doesn't belong to username / bio
  const [generalError, setGeneralError] = useState('');

  const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target?.value);
  }, []);

  const handleDescriptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target?.value);
  }, []);

  const hasEnteredValue = useMemo(
    () => title.length > 0 || description.length > 0,
    [title, description]
  );

  const buttonText = useMemo(() => {
    // Collection is being created
    if (stagedItems) {
      return 'create';
    }

    return hasEnteredValue ? 'save' : 'skip';
  }, [hasEnteredValue, stagedItems]);

  const goToNextStep = useCallback(() => {
    onNext();
    hideModal();
  }, [onNext, hideModal]);

  const [isLoading, setIsLoading] = useState(false);

  const updateCollection = useUpdateCollectionInfo();
  const createCollection = useCreateCollection();

  const track = useTrack();

  const handleClick = useCallback(async () => {
    setGeneralError('');

    if (description.length > COLLECTION_DESCRIPTION_MAX_CHAR_COUNT) {
      // No need to handle error here, since the form will mark the text as red
      return;
    }

    setIsLoading(true);
    try {
      // Collection is being updated
      if (collectionId) {
        track('Update collection', {
          id: collectionId,
          title,
          description,
        });
        await updateCollection(collectionId, title, description);
      }

      // Collection is being created
      if (!collectionId && stagedItems && layout) {
        track('Create collection', {
          added_name: title.length > 0,
          added_description: description.length > 0,
          nft_ids: removeWhitespacesFromStagedItems(stagedItems).map(({ dbid: id }) => id),
        });
        await createCollection(galleryId, title, description, stagedItems, layout);
      }

      goToNextStep();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setGeneralError(formatError(error));
      }
    }

    setIsLoading(false);
  }, [
    description,
    collectionId,
    stagedItems,
    goToNextStep,
    updateCollection,
    title,
    createCollection,
    galleryId,
    layout,
    track,
  ]);

  return (
    <StyledCollectionEditInfoForm>
      <Spacer height={16} />
      <BigInput
        onChange={handleNameChange}
        defaultValue={unescapedCollectionName}
        placeholder="Collection name"
        autoFocus
      />
      <Spacer height={16} />
      <StyledTextAreaWithCharCount
        onChange={handleDescriptionChange}
        placeholder="Tell us about your collection..."
        defaultValue={unescapedCollectorsNote}
        currentCharCount={description.length}
        maxCharCount={COLLECTION_DESCRIPTION_MAX_CHAR_COUNT}
        showMarkdownShortcuts
        hasPadding
      />
      {generalError && (
        <>
          <Spacer height={8} />
          <ErrorText message={generalError} />
        </>
      )}
      <Spacer height={16} />

      {/* TODO [GAL-256]: This spacer and button should be part of a new ModalFooter */}
      <Spacer height={12} />
      <ButtonContainer>
        <Button onClick={handleClick} disabled={isLoading} pending={isLoading}>
          {buttonText}
        </Button>
      </ButtonContainer>
    </StyledCollectionEditInfoForm>
  );
}

const StyledCollectionEditInfoForm = styled.div`
  display: flex;
  flex-direction: column;

  @media only screen and ${breakpoints.tablet} {
    padding: 0px;
  }
`;

const StyledTextAreaWithCharCount = styled(TextAreaWithCharCount)`
  height: 144px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export default CollectionCreateOrEditForm;
