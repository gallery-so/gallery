import { FormEvent, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import unescape from 'utils/unescape';

import { TitleS } from 'components/core/Text/Text';
import Input from 'components/core/Input/Input';
import { TextAreaWithCharCount } from 'components/core/TextArea/TextArea';
import { MODAL_PADDING_PX } from 'contexts/modal/constants';
import { Spacer, VStack } from 'components/core/Spacer/Stack';

type Props = {
  className?: string;
  mode?: 'Add' | 'Edit';
  onSubmit: () => void;
  username: string;
  usernameError: string;
  onUsernameChange: (username: string) => void;
  bio: string;
  onBioChange: (bio: string) => void;
};

export const BIO_MAX_CHAR_COUNT = 600;

function UserInfoForm({
  className,
  onSubmit,
  username,
  usernameError,
  onUsernameChange,
  bio,
  onBioChange,
  mode,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unescapedBio = useMemo(() => unescape(bio), [bio]);

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      if (onSubmit instanceof Function) {
        onSubmit();
      }

      setIsSubmitting(false);
    },
    [isSubmitting, onSubmit]
  );

  const handleUsernameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUsernameChange(event.target.value);
    },
    [onUsernameChange]
  );

  const handleBioChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onBioChange(event.target.value);
    },
    [onBioChange]
  );

  // If username isn't filled in, autofocus on field
  const shouldAutofocusUsername = !username;
  // Otherwise, focus on bio
  const shouldAutofocusBio = !shouldAutofocusUsername;

  return (
    <VStack gap={16} className={className} onSubmit={handleSubmit}>
      {mode === 'Add' ? <StyledTitleS>Add username and bio</StyledTitleS> : <Spacer />}
      <Input
        onChange={handleUsernameChange}
        placeholder="Username"
        defaultValue={username}
        errorMessage={usernameError}
        autoFocus={shouldAutofocusUsername}
        variant="grande"
      />
      <StyledTextAreaWithCharCount
        onChange={handleBioChange}
        placeholder="Tell us about yourself..."
        defaultValue={unescapedBio}
        currentCharCount={unescapedBio.length}
        maxCharCount={BIO_MAX_CHAR_COUNT}
        autoFocus={shouldAutofocusBio}
        showMarkdownShortcuts
        hasPadding
      />
    </VStack>
  );
}

const StyledTitleS = styled(TitleS)`
  padding-bottom: ${MODAL_PADDING_PX}px;
`;

const StyledTextAreaWithCharCount = styled(TextAreaWithCharCount)`
  height: 144px;
`;

export default UserInfoForm;
