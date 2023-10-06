import { ChangeEventHandler, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import Input from '~/components/core/Input/Input';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import ErrorText from '~/components/core/Text/ErrorText';
import { TextAreaWithCharCount } from '~/components/core/TextArea/TextArea';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { contexts } from '~/shared/analytics/constants';
import unescape from '~/shared/utils/unescape';

type Props = {
  onDone: (args: { name: string; description: string }) => void;

  mode: 'creating' | 'editing';

  name?: string;
  description: string;
};

export const GALLERY_DESCRIPTION_MAX_CHAR_COUNT = 1200;

export function GalleryNameAndDescriptionEditForm({
  onDone,
  mode,
  name: initialName,
  description: initialDescription,
}: Props) {
  const { hideModal } = useModalActions();

  const unescapedName = useMemo(() => unescape(initialName ?? ''), [initialName]);
  const unescapedDescription = useMemo(() => unescape(initialDescription), [initialDescription]);

  const [name, setName] = useState(unescapedName ?? '');
  const [description, setDescription] = useState(unescapedDescription ?? '');

  // Generic error that doesn't belong to username / bio
  const [generalError, setGeneralError] = useState('');

  const handleNameChange = useCallback<ChangeEventHandler<HTMLInputElement>>((event) => {
    setName(event.target?.value);
  }, []);

  const handleDescriptionChange = useCallback<ChangeEventHandler<HTMLTextAreaElement>>((event) => {
    setDescription(event.target?.value);
  }, []);

  const handeSkipNameAndDescription = useCallback(() => {
    hideModal();

    onDone({
      name: '',
      description: '',
    });
  }, [hideModal, onDone]);

  const handleClick = useCallback(async () => {
    setGeneralError('');

    if (description.length > GALLERY_DESCRIPTION_MAX_CHAR_COUNT) {
      setGeneralError(
        `The gallery description cannot be longer than ${GALLERY_DESCRIPTION_MAX_CHAR_COUNT} characters.`
      );

      return;
    }

    hideModal();
    onDone({ name, description });
  }, [description, hideModal, name, onDone]);

  return (
    <Container>
      <VStack gap={16}>
        <Input
          onChange={handleNameChange}
          defaultValue={unescapedName}
          placeholder="Gallery name"
          autoFocus
          variant="grande"
        />
        <VStack>
          <StyledTextAreaWithCharCount
            onChange={handleDescriptionChange}
            placeholder="Tell us about your gallery..."
            defaultValue={unescapedDescription}
            currentCharCount={description.length}
            maxCharCount={GALLERY_DESCRIPTION_MAX_CHAR_COUNT}
            showMarkdownShortcuts
            hasPadding
          />
          {generalError && <StyledErrorText message={generalError} />}
        </VStack>

        <ButtonContainer isNewGallery={mode === 'creating'}>
          {mode === 'creating' && (
            <Button
              eventElementId="Skip Gallery Title and Description Button"
              eventName="Skip Gallery Title and Dsescription"
              eventContext={contexts.Editor}
              variant="secondary"
              onClick={handeSkipNameAndDescription}
            >
              skip and add later
            </Button>
          )}
          <Button
            eventElementId="Save Gallery Title and Description Button"
            eventName="Save Gallery Title and Dsescription"
            eventContext={contexts.Editor}
            onClick={handleClick}
          >
            save
          </Button>
        </ButtonContainer>
      </VStack>
    </Container>
  );
}

const Container = styled(VStack)`
  padding-top: 16px;
  @media only screen and ${breakpoints.tablet} {
    padding: 0px;
  }
`;

const StyledTextAreaWithCharCount = styled(TextAreaWithCharCount)`
  height: 144px;
`;

const ButtonContainer = styled(HStack)<{ isNewGallery: boolean }>`
  padding-top: 12px;
  justify-content: ${({ isNewGallery }) => (isNewGallery ? 'space-between' : 'flex-end')};
`;

const StyledErrorText = styled(ErrorText)`
  padding-top: 8px;
`;
