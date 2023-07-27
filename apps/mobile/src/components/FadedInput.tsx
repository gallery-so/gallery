import { useColorScheme } from 'nativewind';
import { ReactNode } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';

import colors from '~/shared/theme/colors';

type Props = TextInputProps & { icon?: ReactNode };

export function FadedInput({ value, onChange, icon, style, ...props }: Props) {
  const { colorScheme } = useColorScheme();

  return (
    <View
      className="bg-faint dark:bg-black-500 flex flex-row items-center space-x-2 py-1.5 px-3"
      style={style}
    >
      {icon && <View>{icon}</View>}
      <TextInput
        style={{
          fontSize: 14,
          flex: 1,
        }}
        className="dark:text-white"
        placeholderTextColor={colors.metal}
        selectionColor={colorScheme === 'dark' ? colors.offWhite : colors.black['800']}
        textAlignVertical="center"
        value={value}
        {...props}
      />
    </View>
  );
}
