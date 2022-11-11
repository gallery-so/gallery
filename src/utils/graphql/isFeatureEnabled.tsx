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

const EMPLOYEE_FLAGS: Record<FeatureFlag, boolean> = {
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
  // In case a new role gets added, how do we want to handle that new role
  // if the client hasn't been updated to handle the new role.
  '%future added value': {
    WHITE_RHINO: false,
    EMAIL: false,
  },
};

const EMPLOYEE_USER_IDS = new Set(
  process.env.NEXT_PUBLIC_EMPLOYEE_IDS ? process.env.NEXT_PUBLIC_EMPLOYEE_IDS.split(',') : []
);

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
              dbid
              roles
            }
          }
        }
      }
    `,
    queryRef
  );

  const userId = result?.viewer?.user?.dbid;

  function checkEnvironment() {
    return isProduction() ? PROD_FLAGS[flag] : DEV_FLAGS[flag];
  }

  function checkEmployee() {
    if (userId && EMPLOYEE_USER_IDS.has(userId)) {
      return EMPLOYEE_FLAGS[flag];
    }

    return false;
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

  const checks = [checkEnvironment(), checkEmployee(), checkRole()];

  // If any of the checks tell us the feature flag is enabled
  // then the feature flag should be enabled.
  const isEnabled = checks.some((check) => check === true);

  return isEnabled;
}
