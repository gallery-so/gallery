import { useColorScheme } from 'react-native';

import colors from '~/shared/theme/colors';

export function useListContentStyle() {
  const colorScheme = useColorScheme();

  return {
    flex: 1,
    paddingTop: 16,
    backgroundColor: colorScheme === 'light' ? colors.white : colors.black,
  };
}