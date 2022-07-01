import { size } from 'components/core/breakpoints';
import { SMALL_DIMENSIONS_DESKTOP, FEED_EVENT_TOKEN_MARGIN } from './FeedEventTokenPreviews';

// 105px per column * 10 columns
export const FEED_MAX_WIDTH = 950;

export const FEED_EVENT_ROW_WIDTH_DESKTOP =
  SMALL_DIMENSIONS_DESKTOP * 4 + FEED_EVENT_TOKEN_MARGIN * 3;
export const FEED_EVENT_ROW_WIDTH_TABLET = size.tablet;
