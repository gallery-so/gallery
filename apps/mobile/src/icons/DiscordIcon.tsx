import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import colors from '~/shared/theme/colors';

const originalWidth = 24;
const originalHeight = 19;

type Props = {
  height?: number;
  width?: number;
};

export function DiscordIcon({ width = originalWidth, height = originalHeight }: Props) {
  const { colorScheme } = useColorScheme();

  const scaledWidth = (height * originalWidth) / originalHeight;
  const scaledHeight = (width * originalHeight) / originalWidth;

  return (
    <Svg width={scaledWidth} height={scaledHeight} viewBox="0 0 24 19" fill="none">
      <Path
        d="M20.331 1.524A19.849 19.849 0 0015.38.001c-.234.418-.446.849-.634 1.29a18.439 18.439 0 00-5.495 0C9.06.85 8.85.418 8.616 0a19.989 19.989 0 00-4.955 1.527C.528 6.164-.322 10.685.103 15.142a19.959 19.959 0 006.073 3.049 14.67 14.67 0 001.3-2.098 12.916 12.916 0 01-2.048-.977c.172-.125.34-.253.502-.378a14.264 14.264 0 0012.142 0c.164.134.332.262.502.378-.654.386-1.34.713-2.052.98.373.733.808 1.434 1.3 2.095a19.869 19.869 0 006.077-3.047c.498-5.169-.852-9.648-3.568-13.62zM8.014 12.401c-1.183 0-2.161-1.074-2.161-2.395 0-1.322.944-2.405 2.157-2.405 1.214 0 2.184 1.083 2.164 2.405-.021 1.321-.954 2.395-2.16 2.395zm7.974 0c-1.186 0-2.16-1.074-2.16-2.395 0-1.322.944-2.405 2.16-2.405 1.215 0 2.178 1.083 2.157 2.405-.02 1.321-.951 2.395-2.157 2.395z"
        fill={colorScheme === 'dark' ? colors.white : colors.black.DEFAULT}
      />
    </Svg>
  );
}
