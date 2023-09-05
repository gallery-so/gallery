import { useColorScheme } from 'nativewind';
import { TextInput } from 'react-native';

import colors from '~/shared/theme/colors';

export function OnboardingTextInput({ ...props }: TextInput['props']) {
  const { colorScheme } = useColorScheme();

  return (
    <TextInput
      style={{
        fontSize: 32,
        fontFamily: 'GTAlpinaStandardLight',
      }}
      className="dark:text-white text-center"
      placeholderTextColor={colors.metal}
      selectionColor={colorScheme === 'dark' ? colors.offWhite : colors.black['800']}
      textAlignVertical="center"
      {...props}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
}
