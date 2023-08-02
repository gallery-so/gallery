import { size } from '~/components/core/breakpoints';

export const FEED_EVENT_TOKEN_MARGIN = 2;

// 105px per column * 10 columns
export const FEED_MAX_WIDTH = 1050 + FEED_EVENT_TOKEN_MARGIN * 2;

export const FEED_EVENT_ROW_WIDTH_DESKTOP = FEED_MAX_WIDTH;

export const FEED_EVENT_PADDING_DESKTOP = 16;
export const FEED_EVENT_PADDING_TABLET = 16;
export const FEED_EVENT_PADDING_MOBILE = 16;

/**
 * Helper types + util to calculate the dimensions for tokens displayed on the feed.
 * This hardcore logic is necessary for the virtualizer to know exactly what it's rendering.
 *
 * These are defined in this file to avoid circular imports.
 */
type getFeedTokenDimensionsProps = {
  numTokens: NumTokens;
  maxWidth: number;
  breakpoint: size;
  isInCaption?: boolean;
};

export type NumTokens = '1' | '2' | '3' | '4';
type NumTokensToDimensionMap = { [tokens in NumTokens]: number };

export const getFeedTokenDimensions = ({
  numTokens,
  maxWidth,
  breakpoint,
  isInCaption,
}: getFeedTokenDimensionsProps): NumTokensToDimensionMap[NumTokens] => {
  const paddingCount = isInCaption ? 4 : 2;

  if (breakpoint === size.desktop) {
    return {
      '1': 380,
      '2': 340,
      '3': 320,
      '4':
        (FEED_MAX_WIDTH - FEED_EVENT_TOKEN_MARGIN * 3 - FEED_EVENT_PADDING_DESKTOP * paddingCount) /
        4,
    }[numTokens];
  }

  if (breakpoint === size.tablet) {
    return {
      '1': 380,
      '2': 320,
      '3': (maxWidth - FEED_EVENT_TOKEN_MARGIN * 2 - FEED_EVENT_PADDING_TABLET * paddingCount) / 3,
      '4': (maxWidth - FEED_EVENT_TOKEN_MARGIN * 3 - FEED_EVENT_PADDING_TABLET * paddingCount) / 4,
    }[numTokens];
  }

  return {
    '1': 320,
    // eslint-disable-next-line no-implicit-coercion
    '2': (maxWidth - FEED_EVENT_TOKEN_MARGIN * 1 - FEED_EVENT_PADDING_MOBILE * paddingCount) / 2,
    '3': (maxWidth - FEED_EVENT_TOKEN_MARGIN * 2 - FEED_EVENT_PADDING_MOBILE * paddingCount) / 3,
    '4': (maxWidth - FEED_EVENT_TOKEN_MARGIN * 3 - FEED_EVENT_PADDING_MOBILE * paddingCount) / 4,
  }[numTokens];
};
