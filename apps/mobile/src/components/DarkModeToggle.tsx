import { useColorScheme } from 'nativewind';
import { useCallback } from 'react';

import { IconContainer } from '~/components/IconContainer';

import { DarkModeIcon } from '../icons/DarkModeIcon';
import { LightModeIcon } from '../icons/LightModeIcon';

export function DarkModeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const handlePress = useCallback(() => {
    toggleColorScheme();
  }, [toggleColorScheme]);

  return (
    <IconContainer
      icon={colorScheme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      onPress={handlePress}
    />
  );
}
