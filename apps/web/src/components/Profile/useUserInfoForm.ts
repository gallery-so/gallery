import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTrackCreateUserSuccess } from '~/contexts/analytics/authUtil';
import useAuthPayloadQuery from '~/hooks/api/users/useAuthPayloadQuery';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import formatError from '~/shared/errors/formatError';
import { useDeprecatedCreateUser } from '~/shared/hooks/useCreateUser';
import useDebounce from '~/shared/hooks/useDebounce';
import useUpdateUser, { BIO_MAX_CHAR_COUNT } from '~/shared/hooks/useUpdateUser';
import { useIsUsernameAvailableFetcher } from '~/shared/hooks/useUserInfoFormIsUsernameAvailableQuery';
import {
  alphanumericUnderscores,
  maxLength,
  minLength,
  noConsecutivePeriodsOrUnderscores,
  required,
  validate,
} from '~/shared/utils/validators';

type Props = {
  onSuccess: (username: string) => void;
  existingUsername?: string;
  existingBio?: string;
  userId?: string;
};

export default function useUserInfoForm({
  onSuccess,
  existingUsername,
  existingBio,
  userId,
}: Props) {
  const [bio, setBio] = useState(existingBio ?? '');
  const [username, setUsername] = useState(existingUsername ?? '');

  const usernameFieldIsDirty = useRef(false);

  // This cannot be derived from a "null" `usernameError`
  // since the value starts off as empty when the form is empty
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  // Generic error that doesn't belong to username / bio
  const [generalError, setGeneralError] = useState('');

  const updateUser = useUpdateUser();
  // TODO: use `useCreateUser` instead after web is migrated from magic link -> privy
  const createUserDeprecated = useDeprecatedCreateUser();
  const reportError = useReportError();
  const authPayloadQuery = useAuthPayloadQuery();
  const isUsernameAvailableFetcher = useIsUsernameAvailableFetcher();
  const trackCreateUserSuccess = useTrackCreateUserSuccess(
    authPayloadQuery?.userFriendlyWalletName
  );

  const debouncedUsername = useDebounce(username, 500);

  const handleCreateOrEditUser = useCallback(async (): Promise<{ success: boolean }> => {
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

        await createUserDeprecated(authPayloadQuery, username, bio);
        trackCreateUserSuccess();
      }

      onSuccess(username);

      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'Authentication failed') {
        } else {
          setGeneralError(formatError(error));
        }
      }

      return { success: false };
    }
  }, [
    usernameError,
    bio,
    userId,
    onSuccess,
    username,
    updateUser,
    authPayloadQuery,
    createUserDeprecated,
    trackCreateUserSuccess,
  ]);

  const handleUsernameChange = useCallback((username: string) => {
    setUsername(username);

    setIsUsernameValid(false);
    usernameFieldIsDirty.current = true;
  }, []);

  useEffect(
    function validateUsername() {
      setGeneralError('');

      // it doesn't make sense to tell users their current username is taken!
      if (existingUsername && debouncedUsername === existingUsername) {
        setIsUsernameValid(true);
        return;
      }

      if (debouncedUsername.length < 2) {
        return;
      }

      const clientSideUsernameError = validate(debouncedUsername, [
        required,
        minLength(2),
        maxLength(20),
        alphanumericUnderscores,
        noConsecutivePeriodsOrUnderscores,
      ]);

      if (clientSideUsernameError) {
        setUsernameError(clientSideUsernameError);

        return;
      } else {
        setUsernameError('');
      }

      isUsernameAvailableFetcher(debouncedUsername)
        .then((isUsernameAvailable) => {
          if (!isUsernameAvailable) {
            setUsernameError('Username is taken');
          } else {
            setIsUsernameValid(true);
          }
        })
        .catch((error) => {
          if (error instanceof Error) {
            reportError(error);
          } else {
            reportError('Failure while validating username', {
              tags: { username: debouncedUsername },
            });
          }

          setGeneralError(
            "Something went wrong while validating your username. We're looking into it."
          );
        });
    },
    [debouncedUsername, existingUsername, isUsernameAvailableFetcher, reportError]
  );

  return useMemo(
    () => ({
      bio,
      username,
      generalError,
      usernameError,
      isUsernameValid,
      onBioChange: setBio,
      onEditUser: handleCreateOrEditUser,
      onUsernameChange: handleUsernameChange,
    }),
    [
      bio,
      generalError,
      handleCreateOrEditUser,
      handleUsernameChange,
      isUsernameValid,
      username,
      usernameError,
    ]
  );
}
