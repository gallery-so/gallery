import { useColorScheme } from 'nativewind';
import Svg, { Path, SvgProps } from 'react-native-svg';
import colors from 'shared/theme/colors';

type Props = {
  active?: boolean;
  width?: number;
  colorTheme: 'white' | 'blue' | 'black';
} & SvgProps;

const COLOR_THEME = {
  white: {
    light: {
      activeFillColor: colors.white,
      activeStrokeColor: colors.white,
      inactiveFillColor: 'none',
      inactiveStrokeColor: colors.white,
    },
    dark: {
      activeFillColor: colors.white,
      activeStrokeColor: colors.white,
      inactiveFillColor: 'none',
      inactiveStrokeColor: colors.white,
    },
  },
  blue: {
    light: {
      activeFillColor: colors.activeBlue,
      activeStrokeColor: colors.activeBlue,
      inactiveFillColor: 'none',
      inactiveStrokeColor: colors.black['800'],
    },
    dark: {
      activeFillColor: colors.darkModeBlue,
      activeStrokeColor: colors.darkModeBlue,
      inactiveFillColor: 'none',
      inactiveStrokeColor: colors.black['800'],
    },
  },
  black: {
    light: {
      activeFillColor: colors.black['800'],
      activeStrokeColor: colors.black['800'],
      inactiveFillColor: 'none',
      inactiveStrokeColor: colors.black['800'],
    },
    dark: {
      activeFillColor: colors.white,
      activeStrokeColor: colors.white,
      inactiveFillColor: 'none',
      inactiveStrokeColor: colors.black['800'],
    },
  },
};

export function BookmarkIcon({ active, width, colorTheme, ...props }: Props) {
  const { colorScheme } = useColorScheme();

  return (
    <Svg width={width ?? 25} height={width ?? 24} viewBox="0 0 27 24" fill="none" {...props}>
      <Path
        stroke={
          active
            ? COLOR_THEME[colorTheme][colorScheme].activeStrokeColor
            : COLOR_THEME[colorTheme][colorScheme].inactiveStrokeColor
        }
        fill={
          active
            ? COLOR_THEME[colorTheme][colorScheme].activeFillColor
            : COLOR_THEME[colorTheme][colorScheme].inactiveFillColor
        }
        d="m19.313 20-6.5-6-6.5 6V4h13v16Z"
      />
    </Svg>
  );
}
