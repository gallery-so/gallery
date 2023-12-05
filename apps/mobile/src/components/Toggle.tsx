import clsx from 'clsx';
import { Pressable, View } from 'react-native';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function Toggle({ checked, onChange }: Props) {
  return (
    <Pressable
      onPress={() => {
        onChange(!checked);
      }}
    >
      <View
        className={clsx(
          'relative h-4 w-6 px-0.5 border rounded-lg flex-row',
          checked ? 'justify-end border-activeBlue' : 'justify-start border-shadow'
        )}
      >
        <View
          className={clsx(
            'h-2.5 w-2.5 border rounded-full top-0.5',
            checked ? 'border-activeBlue' : 'border-shadow'
          )}
        />
      </View>
    </Pressable>
  );
}
