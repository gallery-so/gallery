import { useWindowDimensions } from 'react-native';
import { horizontalRowPadding, inBetweenColumnPadding } from './utils';

export function useWidthPerToken(columns: number) {
  const screenDimensions = useWindowDimensions();

  const totalSpaceForTokens =
    screenDimensions.width - horizontalRowPadding * 2 - inBetweenColumnPadding * (columns - 1);

  return totalSpaceForTokens / columns;
}
