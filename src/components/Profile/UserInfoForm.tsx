import { FormEvent, useCallback, useState } from 'react';
import styled from 'styled-components';

import { BodyMedium, Caption } from 'components/core/Text/Text';
import BigInput from 'components/core/BigInput/BigInput';
import TextArea from 'components/core/TextArea/TextArea';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';

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

  const bioLength = bio.length;

  return (
    <StyledForm className={className} onSubmit={handleSubmit}>
      <StyledBodyMedium>{`${mode} username and bio`}</StyledBodyMedium>
      <Spacer height={14} />
      <BigInput
        onChange={handleUsernameChange}
        placeholder="Username"
        defaultValue={username}
        autoFocus
      />
      <Spacer height={10} />
      <StyledBioContainer>
        <StyledTextArea
          onChange={handleBioChange}
          placeholder="Tell us about yourself..."
          defaultValue={bio}
        />
        <StyledCharacterCounter error={bioLength > BIO_MAX_CHAR_COUNT}>
          {bioLength}/{BIO_MAX_CHAR_COUNT}
        </StyledCharacterCounter>
      </StyledBioContainer>
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

const StyledBioContainer = styled.div`
  position: relative;
  height: 144px;
`;

const StyledTextArea = styled(TextArea)`
  width: 100%;
  height: 100%;
`;

const StyledCharacterCounter = styled(Caption)<{ error: boolean }>`
  position: absolute;
  bottom: 8px;
  right: 8px;
  opacity: 0.6;

  color: ${({ error }) => (error ? colors.error : 'inherit')};
`;

export default UserInfoForm;
