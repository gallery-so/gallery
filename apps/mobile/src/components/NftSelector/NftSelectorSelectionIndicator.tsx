import clsx from 'clsx';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { CheckIcon } from 'src/icons/CheckIcon';

type Props = {
  selected: boolean;
};

export function NftSelectorSelectionIndicator({ selected }: Props) {
  const animateStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(selected ? 1 : 0),
    };
  });

  return (
    <Animated.View
      className={clsx(
        'absolute top-1 right-1 h-3 w-3 rounded-full border border-white shadow flex items-center justify-center',
        selected ? 'bg-activeBlue' : 'bg-white/30'
      )}
    >
      {selected ? (
        <Animated.View style={animateStyle}>
          <CheckIcon />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
