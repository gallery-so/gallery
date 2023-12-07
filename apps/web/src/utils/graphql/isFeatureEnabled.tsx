import { graphql, readInlineData } from 'relay-runtime';

import type { Role } from '~/generated/enums';
import { isFeatureEnabledFragment$key } from '~/generated/isFeatureEnabledFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import isProduction from '~/utils/isProduction';

export enum FeatureFlag {
  KOALA = 'KOALA',
  ACTIVITY_BADGE = 'ACTIVITY_BADGE',
}

const PROD_FLAGS: Record<FeatureFlag, boolean> = {
  KOALA: true,
  ACTIVITY_BADGE: false,
};

const DEV_FLAGS: Record<FeatureFlag, boolean> = {
  KOALA: true,
  ACTIVITY_BADGE: true,
};

export const ROLE_FLAGS: Record<Role, Record<FeatureFlag, boolean>> = {
  ADMIN: {
    KOALA: true,
    ACTIVITY_BADGE: true,
  },
  BETA_TESTER: {
    KOALA: true,
    ACTIVITY_BADGE: false,
  },
  EARLY_ACCESS: {
    KOALA: true,
    ACTIVITY_BADGE: false,
  },
};

/**
 * Returns a boolean depending on whether a feature is enabled for a user.
 * 1) This function will work even if the user is logged out, in which case it will default to using environment-based FF
 * 2) If logged in, the employee-based FF will have the highest precedence. In other words, if a feature flag is enabled
 *    on production, but explicitly disabled for employees, it will use the employee setting (disabled).
 */
export default function isFeatureEnabled(
  flag: FeatureFlag,
  queryRef: isFeatureEnabledFragment$key
) {
  const result = readInlineData(
    graphql`
      fragment isFeatureEnabledFragment on Query @inline {
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

  function checkEnvironment() {
    return isProduction() ? PROD_FLAGS[flag] : DEV_FLAGS[flag];
  }

  function checkRole() {
    const roles = removeNullValues(result.viewer?.user?.roles);

    const anyRoleEnablesFeatureFlag = roles.some((role) => {
      // Safe guard to ensure we're actually using a flag that the client
      // knows about. It could be the case that the backend added a new field
      // and the client has not been updated to know about that new field
      //
      // In that case, we'll assume the flag is not enabled.
      if (!(role in ROLE_FLAGS)) {
        return false;
      }

      // We safe guarded above so it's okay to ignore this here
      // @ts-expect-error https://stackoverflow.com/questions/57928920/typescript-narrowing-of-keys-in-objects-when-passed-to-function
      const roleEnablesFeatureFlag = ROLE_FLAGS[role][flag];

      return roleEnablesFeatureFlag;
    });

    return anyRoleEnablesFeatureFlag;
  }

  const isEnabled = checkEnvironment() || checkRole();

  return isEnabled;
}
