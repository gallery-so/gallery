import { TouchableOpacityProps } from 'react-native';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { contexts } from '~/shared/analytics/constants';

import { AdmireIcon } from './AdmireIcon';

type Props = {
  style?: TouchableOpacityProps['style'];

  onPress: () => void;
  isAdmired: boolean;
};

export function AdmireButton({ isAdmired, onPress, style }: Props) {
  return (
    <GalleryTouchableOpacity
      onPress={onPress}
      className="flex w-8 h-8 pt-0.5"
      style={style}
      eventElementId="Admire Button"
      eventName="Admire Button Clicked"
      eventContext={contexts.Posts}
    >
      <AdmireIcon active={isAdmired} />
    </GalleryTouchableOpacity>
  );
}
