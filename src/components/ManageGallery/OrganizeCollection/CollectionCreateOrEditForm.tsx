import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import Input from '~/components/core/Input/Input';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import ErrorText from '~/components/core/Text/ErrorText';
import { TextAreaWithCharCount } from '~/components/core/TextArea/TextArea';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { TokenSettings } from '~/contexts/collectionEditor/CollectionEditorContext';
import { useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { useModalActions } from '~/contexts/modal/ModalContext';
import formatError from '~/errors/formatError';
import useCreateCollection from '~/hooks/api/collections/useCreateCollection';
import useUpdateCollectionInfo from '~/hooks/api/collections/useUpdateCollectionInfo';
import { getTokenIdsFromCollection } from '~/utils/collectionLayout';
import unescape from '~/utils/unescape';

import { StagedCollection } from './types';

type Props = {
  onNext: (collectionId: string) => void;
  galleryId: string;
  collectionId?: string;
  collectionName?: string;
  collectionCollectorsNote?: string;
  stagedCollection?: StagedCollection;
  tokenSettings?: TokenSettings;
};

export const COLLECTION_DESCRIPTION_MAX_CHAR_COUNT = 600;

function CollectionCreateOrEditForm({
  onNext,
  galleryId,
  collectionId,
  collectionName,
  collectionCollectorsNote,
  stagedCollection,
  tokenSettings = {},
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
    if (stagedCollection) {
      return 'create';
    }

    return hasEnteredValue ? 'save' : 'skip';
  }, [hasEnteredValue, stagedCollection]);

  const goToNextStep = useCallback(
    (collectionId: string) => {
      onNext(collectionId);
      hideModal();
    },
    [onNext, hideModal]
  );

  const [isLoading, setIsLoading] = useState(false);

  const updateCollection = useUpdateCollectionInfo();
  const createCollection = useCreateCollection();

  const track = useTrack();
  const reportError = useReportError();

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

        goToNextStep(collectionId);
      } else if (stagedCollection) {
        track('Create collection', {
          added_name: title.length > 0,
          added_description: description.length > 0,
          nft_ids: getTokenIdsFromCollection(stagedCollection),
        });

        const response = await createCollection({
          galleryId,
          title,
          description,
          stagedCollection: stagedCollection,
          tokenSettings,
        });

        if (
          response.createCollection?.__typename === 'CreateCollectionPayload' &&
          response.createCollection.collection
        ) {
          goToNextStep(response.createCollection.collection.dbid);
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        reportError(error);
        setGeneralError(formatError(error));
      }

      reportError('Something unexpected occurred while trying to update a collection', {
        tags: {
          title,
          galleryId,
          description,
        },
      });
    }

    setIsLoading(false);
  }, [
    description,
    collectionId,
    stagedCollection,
    track,
    title,
    updateCollection,
    goToNextStep,
    createCollection,
    galleryId,
    tokenSettings,
    reportError,
  ]);

  return (
    <StyledCollectionEditInfoForm>
      <VStack gap={16}>
        <Input
          onChange={handleNameChange}
          defaultValue={unescapedCollectionName}
          placeholder="Collection name"
          autoFocus
          variant="grande"
        />
        <VStack>
          <StyledTextAreaWithCharCount
            onChange={handleDescriptionChange}
            placeholder="Tell us about your collection..."
            defaultValue={unescapedCollectorsNote}
            currentCharCount={description.length}
            maxCharCount={COLLECTION_DESCRIPTION_MAX_CHAR_COUNT}
            showMarkdownShortcuts
            hasPadding
          />
          {generalError && <StyledErrorText message={generalError} />}
        </VStack>
        {/* TODO [GAL-256]: This spacer and button should be part of a new ModalFooter */}
        <ButtonContainer justify="flex-end">
          <Button onClick={handleClick} disabled={isLoading} pending={isLoading}>
            {buttonText}
          </Button>
        </ButtonContainer>
      </VStack>
    </StyledCollectionEditInfoForm>
  );
}

const StyledCollectionEditInfoForm = styled(VStack)`
  padding-top: 16px;
  @media only screen and ${breakpoints.tablet} {
    padding: 0px;
  }
`;

const StyledTextAreaWithCharCount = styled(TextAreaWithCharCount)`
  height: 144px;
`;

const ButtonContainer = styled(HStack)`
  padding-top: 12px;
`;

const StyledErrorText = styled(ErrorText)`
  padding-top: 8px;
`;

export default CollectionCreateOrEditForm;
