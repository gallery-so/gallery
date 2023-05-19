import { useColorScheme } from 'nativewind';
import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export function LandingLogo(props: SvgProps) {
  const { colorScheme } = useColorScheme();
  return (
    <Svg width={147} height={35} fill="none" {...props}>
      <Path
        d="M27.15 20.817c0-2.17.328-2.73 1.603-2.828v-1.183h-8.911v1.18c3.106.13 4.496-.24 4.496 2.47l.01 4.316a5.574 5.574 0 0 1-.692 1.539c-.672.988-1.784 1.447-3.287 1.447-3.561 0-5.668-3.78-5.668-10.293 0-6.512 1.94-10.382 5.83-10.382 3.008 0 4.82 1.998 5.28 6.207h1.342V6.154h-1.275c-.165.823-.295 1.052-.59 1.052-.522 0-1.974-1.47-4.884-1.47-5.46 0-9.056 4.923-9.056 11.862 0 7.003 3.438 11.54 9.087 11.54h.01c3.332 0 4.394-2.236 4.621-2.947l.8 2.652h1.274l.01-8.026ZM117.267 25.859c.827 1.365 1.291 1.764 1.887 1.931v1.033h-3.609L108.989 17.3h-2.152v7.626c0 2.299.463 2.764 2.383 2.864v1.033h-7.416V27.79c1.953-.067 2.284-.37 2.284-2.697V9.903c0-2.332-.331-2.632-2.284-2.698V6.173h7.981c4.238 0 6.489 1.964 6.489 5.294 0 2.765-1.588 4.763-4.403 5.496l5.396 8.896Zm-10.43-9.757h1.953c2.947 0 4.437-1.666 4.437-4.53 0-2.797-1.258-4.199-3.807-4.199h-2.578l-.005 8.729ZM130.258 6.176h5.402V7.21c-.628.165-1.026.532-1.82 2.165l-5.233 10.457v4.995c0 2.498.531 2.864 2.456 2.964v1.033h-7.693V27.79c1.921-.1 2.485-.465 2.485-2.964V19.93l-5.403-10.556c-.828-1.633-1.193-2-1.854-2.165V6.176h6.791V7.21c-1.556.132-2.087.37-2.087 1.099 0 .37.132.799.563 1.698l3.98 8.093 3.94-7.926c.397-.8.529-1.333.529-1.766 0-.8-.462-1.066-2.053-1.198l-.003-1.033ZM50.299 28.823V27.79c1.953-.067 2.284-.37 2.284-2.697V9.903c0-2.332-.33-2.631-2.284-2.698V6.173h7.482v1.032c-2.152.067-2.455.632-2.455 3.064v14.487c0 2.198.368 2.864 2.383 2.864h2.384c2.45 0 3.113-.9 4.339-6.727h1.35l-.86 7.926-14.623.004ZM67.655 28.823V27.79c1.953-.067 2.285-.37 2.285-2.697V9.903c0-2.332-.332-2.631-2.285-2.698V6.173h7.484v1.032c-2.153.067-2.456.632-2.456 3.064v14.487c0 2.198.368 2.864 2.385 2.864h2.383c2.456 0 3.113-.9 4.338-6.727h1.36l-.859 7.926-14.635.004ZM45.63 24.194 39.767 6.175h-5.394v1.032c2.21 0 2.629 1.66 2.285 2.698L31.92 24.23c-.927 2.864-1.324 3.43-2.384 3.563v1.032h6.16v-1.032c-1.855-.067-2.58-.466-2.58-1.565 0-.433.134-1.066.37-1.833l1.026-3.096h7.318l.96 2.964c.297.865.43 1.498.43 1.965 0 1.1-.728 1.498-2.456 1.565v1.032h7.348v-1.032c-1.126-.137-1.555-.77-2.483-3.6Zm-10.696-4.297 3.212-9.824 3.212 9.824h-6.424ZM99.217 22.06l-.369 6.761h-14.4V27.79c1.954-.067 2.285-.37 2.285-2.697V9.902c0-2.333-.33-2.631-2.284-2.698V6.17h14.139l.264 5.728h-1.357c-.464-3.696-1.126-4.53-4.272-4.53h-3.741v9.293h2.682c2.417 0 2.748-.4 2.947-3.43h1.291v8.06h-1.291c-.2-3.031-.53-3.431-2.947-3.431h-2.682v7.227c0 2.065.43 2.53 2.416 2.53h2.12c2.648 0 3.344-1.165 3.84-5.557h1.359ZM10.284 34.998C-2.764 27.257-2.76 7.738 10.284 0l.648 1.025a20.186 20.186 0 0 0-6.346 7.204c-4.684 8.849-1.89 20.097 6.346 25.746L10.284 35v-.002ZM136.717.001c13.047 7.74 13.041 27.26 0 34.997l-.649-1.026a20.193 20.193 0 0 0 6.346-7.2c4.683-8.848 1.891-20.098-6.346-25.747l.649-1.024Z"
        fill={colorScheme === 'dark' ? colors.white : colors.offBlack}
      />
    </Svg>
  );
}
