import { useColorScheme } from 'nativewind';
import Svg, { Path } from 'react-native-svg';

import colors from '~/shared/theme/colors';
type Props = {
  height?: number;
  width?: number;
};

export function QuestionMarkIcon({ height = 16, width = 16 }: Props) {
  const { colorScheme } = useColorScheme();
  return (
    <Svg width={width} height={height} viewBox="0 0 9 16" fill="none">
      <Path
        fill={colorScheme === 'dark' ? colors.white : colors.black.DEFAULT}
        d="M.5 4.5a4 4 0 0 1 .304-1.53l.924.382A3 3 0 0 0 1.5 4.5h-1Zm.304-1.53a4 4 0 0 1 .867-1.298l.708.707c-.278.279-.5.61-.651.973L.804 2.97Zm.867-1.298A4 4 0 0 1 2.97.804l.383.924a3 3 0 0 0-.973.65l-.708-.706h-.001ZM2.97.804A4 4 0 0 1 4.5.5v1a3 3 0 0 0-1.147.228L2.97.804ZM4.5.5h.4v1h-.4v-1Zm.4 0a4 4 0 0 1 2.83 1.172l-.708.707A3 3 0 0 0 4.9 1.5v-1Zm2.83 1.172A4 4 0 0 1 8.898 4.5h-1a3 3 0 0 0-.878-2.121l.707-.707h.003ZM8.898 4.5a4 4 0 0 1-1.17 2.828l-.708-.707A3 3 0 0 0 7.9 4.5h1-.002ZM7.73 7.328c-.197.197-.49.406-.748.6a6.833 6.833 0 0 0-.829.714C5.633 9.183 5.2 9.907 5.2 11h-1c0-1.407.575-2.367 1.23-3.05.322-.335.662-.603.948-.82.306-.231.51-.377.642-.509l.708.707h.002ZM4.198 13v-2h1v2h-1ZM4.7 16a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z"
      />
    </Svg>
  );
}
