import { useColorScheme } from 'react-native';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

export const ChatIcon = (props: SvgProps) => {
  const colorScheme = useColorScheme();
  return (
    <Svg width={14} height={14} fill="none" {...props}>
      <Path
        d="M4.59985 14.7529C3.51522 14.1072 2.61459 13.1938 1.98425 12.1001C1.35392 11.0065 1.01501 9.76931 1 8.50713C1.072 4.2773 5.15783 0.920439 10.1256 1.00144C15.0934 1.08243 19.0623 4.60129 18.9993 8.79511C18.9363 12.9889 14.8414 16.3818 9.87364 16.3008C9.31222 16.2918 8.75243 16.2376 8.1997 16.1388L4.14987 18.1007L4.59985 14.7529Z"
        fill="none"
        stroke={colorScheme === 'dark' ? colors.white : colors.offBlack}
      />
    </Svg>
  );
};
