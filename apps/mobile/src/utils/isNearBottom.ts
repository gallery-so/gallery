import { Dimensions, NativeScrollEvent } from 'react-native';

const paddingToBottom = Dimensions.get('screen').height * 2;

export function isNearBottom({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) {
  return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
}
