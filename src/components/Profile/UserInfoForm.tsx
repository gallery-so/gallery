import { FormEvent, useCallback, useState } from 'react';
import styled from 'styled-components';

import { BodyMedium } from 'components/core/Text/Text';
import BigInput from 'components/core/BigInput/BigInput';
import { TextAreaWithCharCount } from 'components/core/TextArea/TextArea';
import Spacer from 'components/core/Spacer/Spacer';

type Props = {
  className?: string;
  mode?: 'Add' | 'Edit';
  onSubmit: () => void;
  username: string;
  usernameError: string;
  clearUsernameError: () => void;
  onUsernameChange: (username: string) => void;
  bio: string;
  onBioChange: (bio: string) => void;
};

export const BIO_MAX_CHAR_COUNT = 500;

function UserInfoForm({
  className,
  onSubmit,
  username,
  usernameError,
  clearUsernameError,
  onUsernameChange,
  bio,
  onBioChange,
  mode = 'Add',
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    [isSubmitting, onSubmit],
  );

  const handleUsernameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUsernameChange(event.target.value);
      clearUsernameError();
    },
    [onUsernameChange, clearUsernameError],
  );

  const handleBioChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onBioChange(event.target.value);
    },
    [onBioChange],
  );

  // If username isn't filled in, autofocus on field
  const shouldAutofocusUsername = !username;
  // Otherwise, focus on bio
  const shouldAutofocusBio = !shouldAutofocusUsername;

  return (
    <StyledForm className={className} onSubmit={handleSubmit}>
      <StyledBodyMedium>{`${mode} username and bio`}</StyledBodyMedium>
      <Spacer height={8} />
      <BigInput
        onChange={handleUsernameChange}
        placeholder="Username"
        defaultValue={username}
        errorMessage={usernameError}
        autoFocus={shouldAutofocusUsername}
      />
      <Spacer height={24} />
      <StyledTextAreaWithCharCount
        onChange={handleBioChange}
        placeholder="Tell us about yourself..."
        defaultValue={bio}
        currentCharCount={bio.length}
        maxCharCount={BIO_MAX_CHAR_COUNT}
        autoFocus={shouldAutofocusBio}
      />
    </StyledForm>
  );
}

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const StyledBodyMedium = styled(BodyMedium)`
  padding-left: 4px;
`;

const StyledTextAreaWithCharCount = styled(TextAreaWithCharCount)`
  height: 144px;
`;

export default UserInfoForm;
