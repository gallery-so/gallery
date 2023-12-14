import { useColorScheme } from 'nativewind';
import Svg, { Path,SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

type Props = {
  height?: number;
  width?: number;
} & SvgProps;

const originalWidth = 48;
const originalHeight = 40;

export function SuperRareIcon({ width = originalWidth, height = originalHeight, ...props }: Props) {
  const { colorScheme } = useColorScheme();

  const scaledWidth = (height * originalWidth) / originalHeight;
  const scaledHeight = (width * originalHeight) / originalWidth;

  return (
    <Svg width={scaledWidth} height={scaledHeight} viewBox="0 0 48 40" fill="none" {...props}>
      <Path
        fill={colorScheme === 'dark' ? colors.white : colors.black.DEFAULT}
        fillRule="evenodd"
        d="M36.947 0H10.42L0 11.154l23.677 28.004 23.69-28.004L36.947 0ZM11.473 11.154l6.994-7.488h15.7l6.993 7.488-14.843 17.555-14.844-17.555Z"
        clipRule="evenodd"
      />
    </Svg>
  );
}
