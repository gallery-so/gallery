import { useColorScheme } from 'nativewind';
import { useCallback } from 'react';
// eslint-disable-next-line no-restricted-imports
import { RefreshControl } from 'react-native';
import { trigger } from 'react-native-haptic-feedback';

import colors from '~/shared/theme/colors';

type GalleryRefreshControlProps = {
  onRefresh: () => void;
  refreshing: boolean;
};
export function GalleryRefreshControl({ onRefresh, refreshing, ...props }: GalleryRefreshControlProps) {
  const { colorScheme } = useColorScheme();

  const handleRefresh = useCallback(() => {
    trigger('impactLight');
    onRefresh();
  }, [onRefresh]);

  return (
    <RefreshControl
      // For iOS
      tintColor={colorScheme === 'dark' ? colors.white : colors.black.DEFAULT}
      // For Android
      colors={colorScheme === 'dark' ? [colors.white] : [colors.black.DEFAULT]}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      {...props}
    />
  );
}
