import { FormEvent, useCallback } from 'react';
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
  onUsernameChange: (username: string) => void;
  bio: string;
  onBioChange: (bio: string) => void;
};

export const BIO_MAX_CHAR_COUNT = 500;

function UserInfoForm({
  className,
  onSubmit,
  username,
  onUsernameChange,
  bio,
  onBioChange,
  mode = 'Add',
}: Props) {
  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      onSubmit?.();
    },
    [onSubmit]
  );

  const handleUsernameChange = useCallback(
    (event) => {
      onUsernameChange(event.target.value);
    },
    [onUsernameChange]
  );

  const handleBioChange = useCallback(
    (event) => {
      onBioChange(event.target.value);
    },
    [onBioChange]
  );

  return (
    <StyledForm className={className} onSubmit={handleSubmit}>
      <StyledBodyMedium>{`${mode} username and bio`}</StyledBodyMedium>
      <Spacer height={8} />
      <BigInput
        onChange={handleUsernameChange}
        placeholder="Username"
        defaultValue={username}
        autoFocus
      />
      <Spacer height={24} />
      <StyledTextAreaWithCharCount
        onChange={handleBioChange}
        placeholder="Tell us about yourself..."
        defaultValue={bio}
        currentCharCount={bio.length}
        maxCharCount={BIO_MAX_CHAR_COUNT}
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
