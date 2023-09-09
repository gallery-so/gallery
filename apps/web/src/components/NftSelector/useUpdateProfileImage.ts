import { useCallback } from 'react';
import { graphql } from 'react-relay';

import {
  ChainAddressInput,
  useUpdateProfileImageMutation,
} from '~/generated/useUpdateProfileImageMutation.graphql';
import { useUpdateProfileImageRemoveMutation } from '~/generated/useUpdateProfileImageRemoveMutation.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

type setProfileImageProps =
  | {
      tokenId: string;
    }
  | {
      walletAddress: ChainAddressInput;
    };

export default function useUpdateProfileImage() {
  const [setProfileImageMutation] = usePromisifiedMutation<useUpdateProfileImageMutation>(graphql`
    mutation useUpdateProfileImageMutation($input: SetProfileImageInput!) @raw_response_type {
      setProfileImage(input: $input) {
        ... on SetProfileImagePayload {
          viewer {
            user {
              profileImage {
                __typename
                ... on TokenProfileImage {
                  __typename
                  token {
                    ...ProfilePictureValidFragment
                    ...getPreviewImageUrlsInlineDangerouslyFragment
                  }
                }
                ... on EnsProfileImage {
                  __typename
                  profileImage {
                    __typename
                    previewURLs {
                      medium
                    }
                  }
                  wallet {
                    __typename
                  }
                }
              }
            }
          }
          ... on SetProfileImagePayloadOrError {
            __typename
          }
        }
      }
    }
  `);

  const [removeProfileImageMutation] =
    usePromisifiedMutation<useUpdateProfileImageRemoveMutation>(graphql`
      mutation useUpdateProfileImageRemoveMutation @raw_response_type {
        removeProfileImage {
          ... on RemoveProfileImagePayload {
            viewer {
              user {
                profileImage {
                  __typename
                  ... on TokenProfileImage {
                    __typename
                    token {
                      ...ProfilePictureValidFragment
                      ...getPreviewImageUrlsInlineDangerouslyFragment
                    }
                  }
                }
              }
            }
          }
          ... on ErrUserNotFound {
            __typename
          }
          ... on ErrAuthenticationFailed {
            __typename
          }
        }
      }
    `);

  const setProfileImage = useCallback(
    (props: setProfileImageProps) => {
      let input = {};

      if ('tokenId' in props) {
        input = {
          tokenId: props.tokenId,
        };
      }

      if ('walletAddress' in props) {
        input = {
          walletAddress: {
            address: props.walletAddress.address,
            chain: props.walletAddress.chain,
          },
        };
      }

      return setProfileImageMutation({
        variables: {
          input,
        },
      });
    },
    [setProfileImageMutation]
  );

  const removeProfileImage = useCallback(() => {
    return removeProfileImageMutation({
      variables: {},
    });
  }, [removeProfileImageMutation]);

  return {
    setProfileImage,
    removeProfileImage,
  };
}
