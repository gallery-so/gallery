import { FeatureFlag } from 'components/core/enums';
import { readInlineData, graphql } from 'relay-runtime';
import isProduction from 'utils/isProduction';
import { isFeatureEnabledFragment$key } from '__generated__/isFeatureEnabledFragment.graphql';

const PROD_FLAGS: Record<FeatureFlag, boolean> = {
  GENERAL_MEMBERSHIP_MINT: true,
  MARKDOWN_SHORTCUTS: true,
  FOLLOW: true,
  POSTER_MINT: false,
};

const DEV_FLAGS: Record<FeatureFlag, boolean> = {
  GENERAL_MEMBERSHIP_MINT: true,
  MARKDOWN_SHORTCUTS: true,
  FOLLOW: true,
  POSTER_MINT: true,
};

const EMPLOYEE_FLAGS: Record<FeatureFlag, boolean> = {
  GENERAL_MEMBERSHIP_MINT: true,
  MARKDOWN_SHORTCUTS: true,
  FOLLOW: true,
  POSTER_MINT: true,
};

const EMPLOYEE_USER_IDS = new Set(['a3ff91986625382ff776067619200efe']);

export default function isFeatureEnabled(
  flag: FeatureFlag,
  viewerRef: isFeatureEnabledFragment$key | null
) {
  const isEnabledBasedOnEnvironment = isProduction() ? PROD_FLAGS[flag] : DEV_FLAGS[flag];

  if (!viewerRef) {
    return isEnabledBasedOnEnvironment;
  }

  const result = readInlineData(
    graphql`
      fragment isFeatureEnabledFragment on ViewerOrError @inline {
        ... on Viewer {
          user {
            dbid
          }
        }
      }
    `,
    viewerRef
  );

  const userId = result?.user?.dbid;

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
