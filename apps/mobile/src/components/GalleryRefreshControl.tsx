import { useColorScheme } from 'nativewind';
// eslint-disable-next-line no-restricted-imports
import { RefreshControl } from 'react-native';

import colors from '~/shared/theme/colors';

type GalleryRefreshControlProps = {
  onRefresh: () => void;
  refreshing: boolean;
};
export function GalleryRefreshControl({ onRefresh, refreshing, ...props }: GalleryRefreshControlProps) {
  const { colorScheme } = useColorScheme();

  return (
    <RefreshControl
      // For iOS
      tintColor={colorScheme === 'dark' ? colors.white : colors.black.DEFAULT}
      // For Android
      colors={colorScheme === 'dark' ? [colors.white] : [colors.black.DEFAULT]}
      refreshing={refreshing}
      onRefresh={onRefresh}
      {...props}
    />
  );
}
