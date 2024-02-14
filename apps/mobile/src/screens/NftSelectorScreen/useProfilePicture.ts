import { useCallback, useState } from 'react';
import { graphql } from 'react-relay';

import { Chain, useProfilePictureMutation } from '~/generated/useProfilePictureMutation.graphql';
import { useProfilePictureSetEnsProfileImageMutation } from '~/generated/useProfilePictureSetEnsProfileImageMutation.graphql';
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
  const [setEnsProfileImage, isSettingsEnsProfilePicture] =
    usePromisifiedMutation<useProfilePictureSetEnsProfileImageMutation>(graphql`
      mutation useProfilePictureSetEnsProfileImageMutation($input: SetProfileImageInput!)
      @raw_response_type {
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

  const handleSetEnsProfileImage = useCallback(
    ({ address, chain }: { address: string; chain: Chain }) => {
      if (!address || !chain) {
        return Promise.resolve();
      }

      return setEnsProfileImage({
        variables: {
          input: {
            walletAddress: { address, chain },
          },
        },
      });
    },
    [setEnsProfileImage]
  );

  return {
    setProfileImage: handlePress,
    isSettingProfileImage,
    setEnsProfileImage: handleSetEnsProfileImage,
    isSettingsEnsProfilePicture,
  };
}
