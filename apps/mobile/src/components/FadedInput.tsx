import { useColorScheme } from 'nativewind';
import { TextInput, TextInputProps, View } from 'react-native';

import colors from '~/shared/theme/colors';

// We don't have any custom props yet
type Props = TextInputProps;

export function FadedInput({ value, onChange, style, ...props }: Props) {
  const { colorScheme } = useColorScheme();

  return (
    <View
      className="bg-faint dark:bg-black-500 flex flex-col justify-center py-1.5 px-3"
      style={style}
    >
      <TextInput
        style={{
          fontSize: 14,
        }}
        className="dark:text-white"
        selectionColor={colorScheme === 'dark' ? colors.offWhite : colors.offBlack}
        textAlignVertical="center"
        value={value}
        {...props}
      />
    </View>
  );
}
