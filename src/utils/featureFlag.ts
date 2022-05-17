import { FeatureFlag } from 'components/core/enums';
import isProduction from './isProduction';

const PROD_FLAGS: Record<FeatureFlag, boolean> = {
  GENERAL_MEMBERSHIP_MINT: true,
  POSTER_PAGE: true,
  MARKDOWN_SHORTCUTS: false,
};

const DEV_FLAGS: Record<FeatureFlag, boolean> = {
  GENERAL_MEMBERSHIP_MINT: true,
  POSTER_PAGE: true,
  MARKDOWN_SHORTCUTS: false,
};

export const isFeatureEnabled = (flag: FeatureFlag) =>
  isProduction() ? PROD_FLAGS[flag] : DEV_FLAGS[flag];
