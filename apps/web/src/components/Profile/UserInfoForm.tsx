import { FormEvent, useCallback, useMemo, useState } from 'react';
// import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import Input from '~/components/core/Input/Input';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleS } from '~/components/core/Text/Text';
import { TextAreaWithCharCount } from '~/components/core/TextArea/TextArea';
import { BIO_MAX_CHAR_COUNT } from '~/shared/hooks/useUpdateUser';
// import { UserInfoFormFragment$key } from '~/generated/UserInfoFormFragment.graphql';
// import { UserInfoFormQueryFragment$key } from '~/generated/UserInfoFormQueryFragment.graphql';
// import { useTrack } from '~/shared/contexts/AnalyticsContext';
// import { removeNullValues } from '~/shared/relay/removeNullValues';
import unescape from '~/shared/utils/unescape';
// import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

// import useNftSelector from '../NftSelector/useNftSelector';
// import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
// import { RawProfilePicture } from '../RawProfilePicture';
// import { ProfilePictureDropdown } from './ProfilePictureDropdown';

type Props = {
  className?: string;
  mode?: 'Add' | 'Edit';
  onSubmit: () => void;
  username: string;
  usernameError: string;
  onUsernameChange: (username: string) => void;
  bio: string;
  onBioChange: (bio: string) => void;

  // userRef: UserInfoFormFragment$key;
  // queryRef: UserInfoFormQueryFragment$key;
};

function UserInfoForm({
  className,
  onSubmit,
  username,
  usernameError,
  onUsernameChange,
  bio,
  onBioChange,
  mode,
}: // userRef,
// queryRef,
Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unescapedBio = useMemo(() => unescape(bio), [bio]);

  // const hasProfileImage = user.profileImage?.__typename === 'TokenProfileImage';

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

  // const handleOpenPfpDropdown = useCallback(() => {
  //   setShowPfpDropdown(true);
  // }, []);
  // const handleClosePfpDropdown = useCallback(() => {
  //   setShowPfpDropdown(false);
  // }, []);

  // const firstLetter = username?.substring(0, 1) ?? undefined;

  return (
    <StyledUserInformContainer as="form" className={className} gap={16} onSubmit={handleSubmit}>
      {mode === 'Add' && (
        <>
          <TitleS>Let's set up your profile</TitleS>
          {/* 
            <div onClick={handleEditPfp}>
              {hasProfileImage ? (
                <ProfilePicture userRef={user} size="xl" isEditable hasInset />
              ) : (
                <RawProfilePicture letter={firstLetter} default hasInset isEditable size="xl" />
              )}
            </div>
           */}
        </>
      )}

      <HStack gap={16} align="center">
        {/* {!mode  && (
          <StyledProfilePictureContainer onClick={handleOpenPfpDropdown}>
            <ProfilePicture userRef={user} size="xl" isEditable hasInset />
            <ProfilePictureDropdown
              open={showPfpDropdown}
              onClose={handleClosePfpDropdown}
              tokensRef={tokens}
              queryRef={query}
            />
          </StyledProfilePictureContainer>
        )} */}

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

// const StyledProfilePictureContainer = styled.div`
//   position: relative;
// `;

export default UserInfoForm;
