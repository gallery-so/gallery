import { FeatureFlag } from 'components/core/enums';
import { readInlineData, graphql } from 'relay-runtime';
import isProduction from 'utils/isProduction';
import { isFeatureEnabledFragment$key } from '__generated__/isFeatureEnabledFragment.graphql';

const PROD_FLAGS: Record<FeatureFlag, boolean> = {
  GENERAL_MEMBERSHIP_MINT: true,
  POSTER_MINT: false,
};

const DEV_FLAGS: Record<FeatureFlag, boolean> = {
  GENERAL_MEMBERSHIP_MINT: true,
  POSTER_MINT: true,
};

const EMPLOYEE_FLAGS: Record<FeatureFlag, boolean> = {
  GENERAL_MEMBERSHIP_MINT: true,
  POSTER_MINT: true,
};

const EMPLOYEE_USER_IDS = new Set(['a3ff91986625382ff776067619200efe']);

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
