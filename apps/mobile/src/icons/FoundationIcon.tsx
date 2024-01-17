import { useColorScheme } from 'nativewind';
import Svg, { Path,SvgProps } from 'react-native-svg';

type Props = {
  height?: number;
  width?: number;
} & SvgProps;

const originalWidth = 283;
const originalHeight = 163;

export function FoundationIcon({
  width = originalWidth,
  height = originalHeight,
  ...props
}: Props) {
  const { colorScheme } = useColorScheme();

  const scaledWidth = (height * originalWidth) / originalHeight;
  const scaledHeight = (width * originalHeight) / originalWidth;

  return (
    <Svg width={scaledWidth} height={scaledHeight} viewBox="0 0 483 163" fill="none" {...props}>
      <Path
        fill={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
        fillRule="evenodd"
        d="M319.319 81.127c0 44.806-36.322 81.127-81.127 81.127-44.806 0-81.127-36.321-81.127-81.127C157.065 36.322 193.386 0 238.192 0c44.805 0 81.127 36.322 81.127 81.127ZM82.019 8.95c1.802-3.122 6.309-3.122 8.111 0l81.385 140.963c1.802 3.122-.451 7.024-4.056 7.024H4.689c-3.604 0-5.857-3.902-4.055-7.024L82.02 8.949ZM339.31 4.84a9.365 9.365 0 0 0-9.365 9.365v133.865a9.365 9.365 0 0 0 9.365 9.366h133.866a9.365 9.365 0 0 0 9.365-9.366V14.204a9.365 9.365 0 0 0-9.365-9.366H339.31Z"
        clipRule="evenodd"
      />
    </Svg>
  );
}
