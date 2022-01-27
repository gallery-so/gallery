import { useCallback, useMemo, useState } from 'react';
import useUpdateUser from 'hooks/api/users/useUpdateUser';

import {
  validate,
  required,
  minLength,
  maxLength,
  alphanumericUnderscores,
  noConsecutivePeriodsOrUnderscores,
} from 'utils/validators';

// Import formatError from 'src/errors/formatError';
import formatError from 'errors/formatError';
import { BIO_MAX_CHAR_COUNT } from './UserInfoForm';

type Props = {
  onSuccess: (username: string) => void;
  existingUsername?: string;
  existingBio?: string;
  userId: string;
};

export default function useUserInfoForm({
  onSuccess,
  existingUsername,
  existingBio,
  userId,
}: Props) {
  const [username, setUsername] = useState(existingUsername ?? '');
  const [usernameError, setUsernameError] = useState('');

  const [bio, setBio] = useState(existingBio ?? '');

  // Generic error that doesn't belong to username / bio
  const [generalError, setGeneralError] = useState('');

  const updateUser = useUpdateUser();

  const handleCreateOrEditUser = useCallback(async () => {
    setGeneralError('');

    // -------------- client-side checks --------------
    const usernameError = validate(username, [
      required,
      minLength(2),
      maxLength(20),
      alphanumericUnderscores,
      noConsecutivePeriodsOrUnderscores,
    ]);

    if (usernameError) {
      setUsernameError(usernameError);
      return;
    }

    if (bio.length > BIO_MAX_CHAR_COUNT) {
      // No need to handle error here, since the form will mark the text as red
      return;
    }
    // ------------ end client-side checks ------------

    try {
      await updateUser(userId, username, bio);

      onSuccess(username);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message?.toLowerCase().includes('username')) {
          setUsernameError('Username is taken');
          return;
        }

        setGeneralError(formatError(error));
      }
    }
  }, [username, bio, updateUser, userId, onSuccess]);

  const handleClearUsernameError = useCallback(() => {
    setUsernameError('');
  }, []);

  const values = useMemo(
    () => ({
      username,
      onUsernameChange: setUsername,
      usernameError,
      onClearUsernameError: handleClearUsernameError,
      bio,
      onBioChange: setBio,
      generalError,
      onEditUser: handleCreateOrEditUser,
    }),
    [bio, generalError, handleClearUsernameError, handleCreateOrEditUser, username, usernameError]
  );

  return values;
}
