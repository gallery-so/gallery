import { PropsWithChildren, useCallback } from 'react';
import { TouchableOpacity } from 'react-native';

import { Typography } from './Typography';

type Props = PropsWithChildren<{
  href?: string;
  onPress?: () => void;
}>;

export function InteractiveLink({ href, onPress, children }: Props) {
  const handlePress = useCallback(() => {
    if (href) {
      // Figure out how to open a link lol
    } else if (onPress) {
      onPress();
    }
  }, [href, onPress]);

  return (
    <TouchableOpacity onPress={handlePress}>
      <Typography
        className="text-shadow underline"
        font={{ family: 'ABCDiatype', weight: 'Regular' }}
      >
        {children}
      </Typography>
    </TouchableOpacity>
  );
}
