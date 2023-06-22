import { useCallback } from 'react';
import { graphql } from 'react-relay';

import { useUpdateProfileImageMutation } from '~/generated/useUpdateProfileImageMutation.graphql';
import { useUpdateProfileImageRemoveMutation } from '~/generated/useUpdateProfileImageRemoveMutation.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

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
                  token {
                    ...getVideoOrImageUrlForNftPreviewFragment
                  }
                }
              }
            }
          }
        }
        ... on SetProfileImagePayloadOrError {
          __typename
        }
        ... on ErrInvalidInput {
          __typename
        }
        ... on ErrNotAuthorized {
          __typename
          message
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
                    token {
                      ...getVideoOrImageUrlForNftPreviewFragment
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
    (tokenId: string) => {
      return setProfileImageMutation({
        variables: {
          input: {
            tokenId,
          },
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
