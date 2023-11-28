import { useColorScheme } from 'nativewind';
import { useMemo } from 'react';
import Svg, { G, Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

type Props = {
  active?: boolean;
  style?: SvgProps['style'];
  height?: number;
} & SvgProps;

export function AdmireIcon({ active = false, style, height = 28, ...props }: Props) {
  const { colorScheme } = useColorScheme();

  const originalHeight = 24;
  const scale = height / originalHeight;
  const width = height;

  const blueToDisplay = useMemo(
    () => (colorScheme === 'dark' ? colors.darkModeBlue : colors.hyperBlue),
    [colorScheme]
  );

  const strokeColor = useMemo(() => {
    if (active) {
      return blueToDisplay;
    }

    return colorScheme === 'dark' ? colors.white : colors.black['800'];
  }, [active, blueToDisplay, colorScheme]);

  const fillColor = useMemo(() => {
    return blueToDisplay;
  }, [blueToDisplay]);

  return (
    <Svg
      width={width}
      height={height}
      fill={active ? fillColor : 'none'}
      {...props}
      style={style}
      stroke={strokeColor}
      viewBox={`0 0 ${width} ${height}`}
    >
      <G transform={`scale(${scale})`}>
        <Path d="M15.5355 6.53553C16.3546 5.71645 16.8602 4.64245 16.975 3.5H17.025C17.1398 4.64245 17.6454 5.71645 18.4645 6.53553C19.2835 7.35462 20.3576 7.86017 21.5 7.97495V8.02505C20.3576 8.13983 19.2835 8.64538 18.4645 9.46447C17.6454 10.2835 17.1398 11.3576 17.025 12.5H16.975C16.8602 11.3576 16.3546 10.2835 15.5355 9.46447C14.7165 8.64538 13.6424 8.13983 12.5 8.02505V7.97495C13.6424 7.86017 14.7165 7.35462 15.5355 6.53553Z" />
        <Path d="M5.82843 15.8284C6.45974 15.1971 6.85823 14.3765 6.96864 13.5H7.03136C7.14177 14.3765 7.54026 15.1971 8.17157 15.8284C8.80289 16.4597 9.6235 16.8582 10.5 16.9686V17.0314C9.6235 17.1418 8.80289 17.5403 8.17157 18.1716C7.54026 18.8029 7.14177 19.6235 7.03136 20.5H6.96864C6.85823 19.6235 6.45974 18.8029 5.82843 18.1716C5.19711 17.5403 4.3765 17.1418 3.5 17.0314V16.9686C4.3765 16.8582 5.19711 16.4597 5.82843 15.8284Z" />
        <Path d="M6 4V9" />
        <Path d="M3.5 6.5H8.5" />
        <Path d="M18 16V21" />
        <Path d="M15.5 18.5H20.5" />
      </G>
    </Svg>
  );
}
