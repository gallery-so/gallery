import { FormEvent, useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import Input from '~/components/core/Input/Input';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleS } from '~/components/core/Text/Text';
import { TextAreaWithCharCount } from '~/components/core/TextArea/TextArea';
import { UserInfoFormFragment$key } from '~/generated/UserInfoFormFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import unescape from '~/shared/utils/unescape';

import useNftSelector from '../NftSelector/useNftSelector';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';

type Props = {
  className?: string;
  mode?: 'Add' | 'Edit';
  onSubmit: () => void;
  username: string;
  usernameError: string;
  onUsernameChange: (username: string) => void;
  bio: string;
  onBioChange: (bio: string) => void;

  userRef: UserInfoFormFragment$key;
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

  userRef,
}: Props) {
  const user = useFragment(
    graphql`
      fragment UserInfoFormFragment on GalleryUser {
        ...ProfilePictureFragment

        tokens {
          ...useNftSelectorQueryFragment
        }
      }
    `,
    userRef
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const tokens = removeNullValues(user.tokens) ?? [];
  const showNftSelector = useNftSelector(tokens);

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
    <StyledUserInformContainer as="form" className={className} gap={16} onSubmit={handleSubmit}>
      {mode === 'Add' && <TitleS>Add username and bio</TitleS>}

      <HStack gap={16} align="center">
        <div onClick={showNftSelector}>
          <ProfilePicture userRef={user} />
        </div>
        <StyledInputContainer>
          <Input
            onChange={handleUsernameChange}
            placeholder="Username"
            defaultValue={username}
            errorMessage={usernameError}
            autoFocus={shouldAutofocusUsername}
            variant="grande"
          />
        </StyledInputContainer>
      </HStack>

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
    </StyledUserInformContainer>
  );
}

const StyledUserInformContainer = styled(VStack)`
  padding-top: 16px;
`;

const StyledTextAreaWithCharCount = styled(TextAreaWithCharCount)`
  height: 144px;
`;

const StyledInputContainer = styled.div`
  width: 100%;
`;

export default UserInfoForm;
