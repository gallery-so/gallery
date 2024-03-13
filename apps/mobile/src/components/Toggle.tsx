import clsx from 'clsx';
import { Pressable, View } from 'react-native';

type Props = {
  checked: boolean;
  onToggle: () => void;
};

export function Toggle({ checked, onToggle }: Props) {
  return (
    <Pressable onPress={onToggle}>
      <View
        className={clsx(
          'relative h-4 w-6 px-0.5 border rounded-lg flex-row',
          checked
            ? 'justify-end border-activeBlue dark:border-darkModeBlue'
            : 'justify-start border-shadow'
        )}
      >
        <View
          className={clsx(
            'h-2.5 w-2.5 border rounded-full top-0.5',
            checked ? 'border-activeBlue dark:border-darkModeBlue' : 'border-shadow'
          )}
        />
      </View>
    </Pressable>
  );
}
