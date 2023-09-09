import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useOptimisticUserInfoFragment$key } from '~/generated/useOptimisticUserInfoFragment.graphql';
import { getPreviewImageUrlsInlineDangerously } from '~/shared/relay/getPreviewImageUrlsInlineDangerously';

export type OptimisticUserInfo = {
  id: string;
  dbid: string;
  username: string;
  profileImageUrl: string;
};

export default function useOptimisticUserInfo(
  queryRef: useOptimisticUserInfoFragment$key
): OptimisticUserInfo {
  const query = useFragment(
    graphql`
      fragment useOptimisticUserInfoFragment on Query {
        viewer {
          ... on Viewer {
            user {
              id
              dbid
              username
              profileImage {
                ... on TokenProfileImage {
                  token {
                    dbid
                    id
                    ...getPreviewImageUrlsInlineDangerouslyFragment
                  }
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const { token } = query.viewer?.user?.profileImage ?? {};

  const imageUrl = useMemo(() => {
    if (token) {
      const result = getPreviewImageUrlsInlineDangerously({ tokenRef: token });
      if (result.type === 'valid') {
        return result.urls.small;
      }
    }
    return null;
  }, [token]);

  const user = query.viewer?.user;
  if (!user) {
    return {
      id: '',
      dbid: '',
      username: '',
      profileImageUrl: '',
    };
  }

  return {
    id: user.id,
    dbid: user.dbid,
    username: user.username ?? '',
    profileImageUrl: imageUrl ?? '',
  };
}
