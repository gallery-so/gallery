import { useColorScheme } from 'nativewind';
import Svg, { Path, SvgProps } from 'react-native-svg';
import colors from 'shared/theme/colors';

type Props = {
  active?: boolean;
} & SvgProps;

const colorMap = {
  light: {
    stroke: colors.black['DEFAULT'],
    fill: colors.offWhite,
    active: colors.activeBlue,
  },
  dark: {
    stroke: colors.white,
    fill: colors.black['DEFAULT'],
    active: colors.activeBlue,
  },
};

export function BookmarkIcon({ active, ...props }: Props) {
  const { colorScheme } = useColorScheme();

  return (
    <Svg width={25} height={24} fill="none" {...props}>
      <Path
        stroke={active ? colorMap[colorScheme].active : colorMap[colorScheme].stroke}
        fill={active ? colorMap[colorScheme].active : colorMap[colorScheme].fill}
        d="m19.313 20-6.5-6-6.5 6V4h13v16Z"
      />
    </Svg>
  );
}
