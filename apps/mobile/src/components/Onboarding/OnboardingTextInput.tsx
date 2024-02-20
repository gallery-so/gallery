import { useColorScheme } from 'nativewind';
import { TextInput } from 'react-native';

import colors from '~/shared/theme/colors';

type Props = {
  style?: TextInput['props']['style'];
} & TextInput['props'];

export function OnboardingTextInput({ ...props }: Props) {
  const { colorScheme } = useColorScheme();

  return (
    <TextInput
      style={{
        fontSize: 32,
        fontFamily: 'GTAlpinaStandardLight',
      }}
      className="dark:text-white"
      placeholderTextColor={colors.metal}
      selectionColor={colorScheme === 'dark' ? colors.offWhite : colors.black['800']}
      textAlignVertical="center"
      {...props}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
}
