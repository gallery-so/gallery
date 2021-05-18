import { useCallback, useMemo, useState } from 'react';
import { USERNAME_REGEX } from 'utils/regex';
import { pause } from 'utils/time';

import { BIO_MAX_CHAR_COUNT } from './UserInfoForm';

type Props = {
  onSuccess: () => void;
};

export default function useUserInfoForm({ onSuccess }: Props) {
  // TODO__v1: auto-populate username and bio from useSwr()
  // const { username, bio } = useSwr('/...')

  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const [bio, setBio] = useState('');

  // generic error that doesn't belong to username / bio
  const [generalError, setGeneralError] = useState('');

  const handleCreateUser = useCallback(async () => {
    setGeneralError('');

    //------------ client-side checks ------------
    if (!username.length) {
      setUsernameError('Required.');
      return;
    }

    if (username.length < 2 || username.length > 20) {
      setUsernameError('Username must be between 2 and 20 characters.');
      return;
    }

    // TODO: while this regex works well for our use case it doesn't
    // define granularly which rule failed; it's hard to differentiate
    // in english whether the error was "too many underscores in a row"
    // vs. something else. maybe we should have more granular rules
    const usernameIsValid = USERNAME_REGEX.test(username);
    if (!usernameIsValid) {
      setUsernameError(
        'Username may only contain alphanumeric characters, underscores, or periods.'
      );
      return;
    }

    if (bio.length > BIO_MAX_CHAR_COUNT) {
      // no need to handle error here, since the form will mark the text as red
      return;
    }
    //------------ end client-side checks ------------

    // TODO__v1: send request to server to UPDATE user's username and bio.
    // it should be an UPDATE because a user entity will have already been
    // created by this step
    try {
      if (username === 'username_taken') {
        await pause(700);
        throw { type: 'ERR_USERNAME_TAKEN' };
      }
      if (username === 'server_error') {
        await pause(700);
        throw { type: 'ERR_SOMETHING_GENERIC' };
      }

      await pause(1000);
      onSuccess();
    } catch (e) {
      // set error message in different locations based on error type
      if (e.type === 'ERR_USERNAME_TAKEN') {
        setUsernameError('This username is already taken. Please try another.');
        return;
      }
      setGeneralError(
        'Sorry, the server is currently unavailable. Please try again later or check our Discord.'
      );
      return;
    }
  }, [username, bio, onSuccess]);

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
