import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import Input from '~/components/core/Input/Input';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import ErrorText from '~/components/core/Text/ErrorText';
import { TextAreaWithCharCount } from '~/components/core/TextArea/TextArea';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { contexts } from '~/shared/analytics/constants';
import { MAX_COLLECTION_DESCRIPTION_LENGTH } from '~/shared/utils/getRemainingCharacterCount';
import unescape from '~/shared/utils/unescape';

type Props = {
  onDone: (args: { name: string; collectorsNote: string }) => void;

  mode: 'creating' | 'editing';

  name?: string;
  collectorsNote?: string;
};

export function CollectionCreateOrEditForm({
  onDone,
  mode,
  name: initialName,
  collectorsNote: initialCollectorsNote,
}: Props) {
  const { hideModal } = useModalActions();

  const unescapedCollectionName = useMemo(() => unescape(initialName ?? ''), [initialName]);
  const unescapedCollectorsNote = useMemo(
    () => unescape(initialCollectorsNote ?? ''),
    [initialCollectorsNote]
  );

  const [name, setName] = useState(unescapedCollectionName ?? '');
  const [collectorsNote, setCollectorsNote] = useState(unescapedCollectorsNote ?? '');

  // Generic error that doesn't belong to username / bio
  const [generalError, setGeneralError] = useState('');

  const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target?.value);
  }, []);

  const handleDescriptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCollectorsNote(event.target?.value);
  }, []);

  const handeSkipNameAndDescription = useCallback(() => {
    hideModal();

    onDone({
      name: '',
      collectorsNote: '',
    });
  }, [hideModal, onDone]);

  const handleClick = useCallback(async () => {
    setGeneralError('');

    if (collectorsNote.length > MAX_COLLECTION_DESCRIPTION_LENGTH) {
      setGeneralError(
        `The collection name cannot be longer than ${MAX_COLLECTION_DESCRIPTION_LENGTH} characters.`
      );

      return;
    }

    hideModal();
    onDone({ name, collectorsNote });
  }, [collectorsNote, hideModal, name, onDone]);

  return (
    <StyledCollectionEditInfoForm>
      <VStack gap={16}>
        <Input
          onChange={handleNameChange}
          defaultValue={unescapedCollectionName}
          placeholder="Section title"
          autoFocus
          variant="grande"
        />
        <VStack>
          <StyledTextAreaWithCharCount
            onChange={handleDescriptionChange}
            placeholder="Tell us about your items..."
            defaultValue={unescapedCollectorsNote}
            currentCharCount={collectorsNote.length}
            maxCharCount={MAX_COLLECTION_DESCRIPTION_LENGTH}
            showMarkdownShortcuts
            hasPadding
          />
          {generalError && <StyledErrorText message={generalError} />}
        </VStack>

        <ButtonContainer isNewCollection={mode === 'creating'}>
          {mode === 'creating' && (
            <Button
              eventElementId="Skip Collection Title and Description Button"
              eventName="Skip Collection Title and Dsescription"
              eventContext={contexts.Editor}
              variant="secondary"
              onClick={handeSkipNameAndDescription}
            >
              skip and add later
            </Button>
          )}
          <Button
            eventElementId="Save Collection Title and Description Button"
            eventName="Save Collection Title and Dsescription"
            eventContext={contexts.Editor}
            onClick={handleClick}
          >
            save
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
  padding-bottom: 32px;
`;

const ButtonContainer = styled(HStack)<{ isNewCollection: boolean }>`
  padding-top: 12px;
  justify-content: ${({ isNewCollection }) => (isNewCollection ? 'space-between' : 'flex-end')};
`;

const StyledErrorText = styled(ErrorText)`
  padding-top: 8px;
`;
