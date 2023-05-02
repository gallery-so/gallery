import { useColorScheme } from 'react-native';

import colors from '~/shared/theme/colors';

export function useListContentStyle() {
  const colorScheme = useColorScheme();

  return {
    backgroundColor: colorScheme === 'light' ? colors.white : colors.black,
    paddingTop: 16,
  };
}
