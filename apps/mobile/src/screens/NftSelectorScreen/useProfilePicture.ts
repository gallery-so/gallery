import { useCallback, useState } from 'react';
import { graphql } from 'react-relay';

import { useProfilePictureMutation } from '~/generated/useProfilePictureMutation.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

export function useProfilePicture() {
  const [setProfileImage, isSettingProfileImage] =
    usePromisifiedMutation<useProfilePictureMutation>(graphql`
      mutation useProfilePictureMutation($input: SetProfileImageInput!) {
        setProfileImage(input: $input) {
          ... on SetProfileImagePayload {
            viewer {
              user {
                ...ProfilePictureFragment
              }
            }
          }
        }
      }
    `);

  const [, setError] = useState<string | null>(null);
  const reportError = useReportError();

  const handlePress = useCallback(
    async (tokenId: string) => {
      setError(null);

      return setProfileImage({
        variables: {
          input: {
            tokenId,
          },
        },
      }).catch((error) => {
        setError(error);
        reportError(error);
      });
    },
    [reportError, setProfileImage]
  );

  return {
    setProfileImage: handlePress,
    isSettingProfileImage,
  };
}
