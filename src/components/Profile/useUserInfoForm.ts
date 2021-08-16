import { useCallback, useMemo, useState } from 'react';
import useUpdateUser from 'hooks/api/users/useUpdateUser';
import formatError from 'src/errors/formatError';
import {
  validate,
  required,
  minLength,
  maxLength,
  alphanumericUnderscoresPeriods,
  noConsecutivePeriodsOrUnderscores,
} from 'utils/validators';

import { BIO_MAX_CHAR_COUNT } from './UserInfoForm';

type Props = {
  onSuccess: () => void;
  existingUsername?: string;
  existingBio?: string;
};

export default function useUserInfoForm({
  onSuccess,
  existingUsername,
  existingBio,
}: Props) {
  const [username, setUsername] = useState(existingUsername || '');
  const [usernameError, setUsernameError] = useState('');

  const [bio, setBio] = useState(existingBio || '');

  // generic error that doesn't belong to username / bio
  const [generalError, setGeneralError] = useState('');
  const updateUser = useUpdateUser();

  const handleCreateUser = useCallback(async () => {
    setGeneralError('');

    //-------------- client-side checks --------------
    const usernameError = validate(username, [
      required,
      minLength(2),
      maxLength(20),
      alphanumericUnderscoresPeriods,
      noConsecutivePeriodsOrUnderscores,
    ]);

    if (usernameError) {
      setUsernameError(usernameError);
      return;
    }

    if (bio.length > BIO_MAX_CHAR_COUNT) {
      // no need to handle error here, since the form will mark the text as red
      return;
    }
    //------------ end client-side checks ------------

    try {
      await updateUser(username, bio);

      onSuccess();
    } catch (e) {
      if (e.message?.toLowerCase().includes('username')) {
        setUsernameError('Username is taken');
        return;
      }
      setGeneralError(formatError(e));
      return;
    }
  }, [username, bio, updateUser, onSuccess]);

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
      onEditUser: handleCreateUser,
    }),
    [
      bio,
      generalError,
      handleClearUsernameError,
      handleCreateUser,
      username,
      usernameError,
    ]
  );

  return values;
}
