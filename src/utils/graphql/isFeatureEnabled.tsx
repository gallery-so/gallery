import { FeatureFlag } from 'components/core/enums';
import { readInlineData, graphql } from 'relay-runtime';
import isProduction from 'utils/isProduction';
import { isFeatureEnabledFragment$key } from '__generated__/isFeatureEnabledFragment.graphql';

const PROD_FLAGS: Record<FeatureFlag, boolean> = {
  GENERAL_MEMBERSHIP_MINT: true,
  POSTER_MINT: true,
  QR_CODE: true,
  FEED: false,
  FEED_ANNOUNCEMENT: false,
};

const DEV_FLAGS: Record<FeatureFlag, boolean> = {
  GENERAL_MEMBERSHIP_MINT: true,
  POSTER_MINT: true,
  QR_CODE: true,
  FEED: true,
  FEED_ANNOUNCEMENT: false,
};

const EMPLOYEE_FLAGS: Record<FeatureFlag, boolean> = {
  GENERAL_MEMBERSHIP_MINT: true,
  POSTER_MINT: true,
  QR_CODE: true,
  FEED: false,
  FEED_ANNOUNCEMENT: true,
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
            }
          }
        }
      }
    `,
    queryRef
  );

  const userId = result?.viewer?.user?.dbid;

  const isEnabledBasedOnEnvironment = isProduction() ? PROD_FLAGS[flag] : DEV_FLAGS[flag];

  // if the user is not logged in, determine based on environment
  if (!userId) {
    return isEnabledBasedOnEnvironment;
  }

  // if employee, determine based on employee flag
  if (EMPLOYEE_USER_IDS.has(userId)) {
    return EMPLOYEE_FLAGS[flag];
  }

  // finally, determine by environment
  return isEnabledBasedOnEnvironment;
}
