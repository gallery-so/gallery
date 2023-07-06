import { graphql, readInlineData } from 'relay-runtime';

import { isAdminRoleFragment$key } from '~/generated/isAdminRoleFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

export default function isAdminRole(queryRef: isAdminRoleFragment$key) {
  const result = readInlineData(
    graphql`
      fragment isAdminRoleFragment on Query @inline {
        viewer {
          ... on Viewer {
            user {
              roles
            }
          }
        }
      }
    `,
    queryRef
  );

  const roles = removeNullValues(result.viewer?.user?.roles);

  return roles.some((role) => role === 'ADMIN');
}
