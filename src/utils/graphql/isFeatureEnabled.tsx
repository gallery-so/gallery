import { graphql, readInlineData } from 'relay-runtime';

import { isFeatureEnabledFragment$key, Role } from '~/generated/isFeatureEnabledFragment.graphql';
import isProduction from '~/utils/isProduction';

export enum FeatureFlag {
  WHITE_RHINO = 'WHITE_RHINO',
  EMAIL = 'EMAIL',
}

const PROD_FLAGS: Record<FeatureFlag, boolean> = {
  WHITE_RHINO: false,
  EMAIL: false,
};

const DEV_FLAGS: Record<FeatureFlag, boolean> = {
  WHITE_RHINO: true,
  EMAIL: true,
};

const ROLE_FLAGS: Record<Role, Record<FeatureFlag, boolean>> = {
  ADMIN: {
    WHITE_RHINO: true,
    EMAIL: true,
  },
  BETA_TESTER: {
    WHITE_RHINO: true,
    EMAIL: false,
  },
  // The below object is what will be used in the case that the backend deployed
  // something that the frontend doesn't know about
  '%future added value': {
    WHITE_RHINO: false,
    EMAIL: false,
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
    const roles = result.viewer?.user?.roles ?? [];

    const anyRoleEnablesFeatureFlag = roles.some((role) => {
      if (!role) {
        return false;
      }

      const roleEnablesFeatureFlag = ROLE_FLAGS[role][flag];

      return roleEnablesFeatureFlag;
    });

    return anyRoleEnablesFeatureFlag;
  }

  const isEnabled = checkEnvironment() || checkRole();

  return isEnabled;
}
