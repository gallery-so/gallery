import { useColorScheme } from 'nativewind';
import Svg, { Path, SvgProps } from 'react-native-svg';
export function HighlightIcon(props: SvgProps) {
  const { colorScheme } = useColorScheme();

  return (
    <Svg width={295} height={205} fill="none" viewBox="0 0 295 205" {...props}>
      <Path
        fill={colorScheme === 'dark' ? '#fff' : '#000'}
        fillRule="evenodd"
        d="M0 0v204.8h192c56.554 0 102.4-45.846 102.4-102.4C294.4 45.846 248.554 0 192 0H0Zm181.12 22.487c-39.391 5.313-69.76 39.066-69.76 79.913 0 40.846 30.369 74.599 69.76 79.912V22.487Zm21.76 159.825c39.391-5.313 69.76-39.066 69.76-79.912 0-40.847-30.369-74.6-69.76-79.913v159.825Zm-73.998.728C104.967 164.295 89.6 135.142 89.6 102.4s15.367-61.895 39.282-80.64H21.76v161.28h107.122Z"
        clipRule="evenodd"
      />
    </Svg>
  );
}
