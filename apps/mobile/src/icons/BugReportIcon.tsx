import { useColorScheme } from 'nativewind';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export const BugReportIcon = (props: SvgProps) => {
  const { colorScheme } = useColorScheme();
  const stroke = colorScheme === 'dark' ? colors.white : colors.black.DEFAULT;

  return (
    <Svg viewBox="0 0 24 24" {...props}>
      <Path d="M10 3h4l2 2v3l1.5 1v8L12 21l-5.5-4V9L8 8V5zM2.5 13h4" fill="none" stroke={stroke} />
      <Path fill="none" stroke={stroke} d="M2.5 7L4.5 9 6.5 9" />
      <Path fill="none" stroke={stroke} d="M21.5 7L19.5 9 17.5 9" />
      <Path fill="none" stroke={stroke} d="M2.5 19L4.5 17 6.5 17" />
      <Path fill="none" stroke={stroke} d="M17.5 17L19.5 17 21.5 19" />
      <Path d="M17.5 13h4" fill="none" stroke={stroke} />
    </Svg>
  );
};
