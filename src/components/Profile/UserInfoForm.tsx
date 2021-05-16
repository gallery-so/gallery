import { FormEvent, useCallback } from 'react';
import styled from 'styled-components';

import { BodyMedium } from 'components/core/Text/Text';
import BigInput from 'components/core/BigInput/BigInput';
import TextArea from 'components/core/TextArea/TextArea';
import Spacer from 'components/core/Spacer/Spacer';

type Props = {
  className?: string;
  onSubmit?: () => void;
  mode?: 'Add' | 'Edit';
  onUsernameChange: (username: string) => void;
  onBioChange: (bio: string) => void;
};

function UserInfoForm({
  className,
  onSubmit,
  onUsernameChange,
  onBioChange,
  mode = 'Add',
}: Props) {
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

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      onSubmit?.();
    },
    [onSubmit]
  );

  return (
    <StyledForm className={className} onSubmit={handleSubmit}>
      <StyledBodyMedium>{`${mode} username and bio`}</StyledBodyMedium>
      <Spacer height={14} />
      <BigInput
        onChange={handleUsernameChange}
        placeholder="Username"
        autoFocus
      />
      <Spacer height={10} />
      <StyledTextArea
        onChange={handleBioChange}
        placeholder="Tell us about yourself..."
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

const StyledTextArea = styled(TextArea)`
  height: 160px;
`;

export default UserInfoForm;
