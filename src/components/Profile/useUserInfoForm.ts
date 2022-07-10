import { useCallback, useEffect, useMemo, useState } from 'react';
import useUpdateUser from 'hooks/api/users/useUpdateUser';
import useCreateUser from 'hooks/api/users/useCreateUser';

import {
  validate,
  required,
  minLength,
  maxLength,
  alphanumericUnderscores,
  noConsecutivePeriodsOrUnderscores,
} from 'utils/validators';

import formatError from 'errors/formatError';
import { BIO_MAX_CHAR_COUNT } from './UserInfoForm';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';
import useDebounce from 'hooks/useDebounce';
import useAuthPayloadQuery from 'hooks/api/users/useAuthPayloadQuery';

type Props = {
  onSuccess: (username: string) => void;
  existingUsername?: string;
  existingBio?: string;
  userId?: string;
};

function useIsUsernameAvailableFetcher() {
  const relayEnvironment = useRelayEnvironment();

  return useCallback(
    async (username: string) => {
      const response = await fetchQuery<any>(
        relayEnvironment,
        graphql`
          query useUserInfoFormIsUsernameAvailableQuery($username: String!) {
            user: userByUsername(username: $username) {
              ... on ErrUserNotFound {
                __typename
              }
            }
          }
        `,
        { username }
      ).toPromise();

      if (response.user?.__typename === 'ErrUserNotFound') {
        return true;
      }
      return false;
    },
    [relayEnvironment]
  );
}

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
  const createUser = useCreateUser();
  const authPayloadQuery = useAuthPayloadQuery();

  const handleCreateOrEditUser = useCallback(async () => {
    setGeneralError('');

    if (usernameError) {
      return { success: false };
    }

    if (bio.length > BIO_MAX_CHAR_COUNT) {
      // No need to handle error here, since the form will mark the text as red
      return { success: false };
    }

    try {
      if (userId) {
        await updateUser(userId, username, bio);
      } else {
        if (!authPayloadQuery) {
          throw new Error('Auth signature for creating user not found');
        }
        await createUser(authPayloadQuery, username, bio);
      }
      onSuccess(username);
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error) {
        setGeneralError(formatError(error));
      }
      return { success: false };
    }
  }, [usernameError, bio, userId, authPayloadQuery, onSuccess, username, updateUser, createUser]);

  const handleUsernameChange = useCallback((username: string) => {
    setUsername(username);
  }, []);

  const isUsernameAvailableFetcher = useIsUsernameAvailableFetcher();

  const debouncedUsername = useDebounce(username, 500);

  // validate username
  useEffect(() => {
    async function validateUsername() {
      if (debouncedUsername.length > 2) {
        const clientSideUsernameError = validate(debouncedUsername, [
          required,
          minLength(2),
          maxLength(20),
          alphanumericUnderscores,
          noConsecutivePeriodsOrUnderscores,
        ]);

        setUsernameError(clientSideUsernameError || '');

        if (!clientSideUsernameError) {
          const isUsernameAvailable = await isUsernameAvailableFetcher(debouncedUsername);
          if (!isUsernameAvailable) {
            setUsernameError('Username is taken');
          }
        }
      }
    }

    validateUsername();
  }, [debouncedUsername, isUsernameAvailableFetcher]);

  const values = useMemo(
    () => ({
      username,
      onUsernameChange: handleUsernameChange,
      usernameError,
      bio,
      onBioChange: setBio,
      generalError,
      onEditUser: handleCreateOrEditUser,
    }),
    [bio, generalError, handleCreateOrEditUser, handleUsernameChange, username, usernameError]
  );

  return values;
}
