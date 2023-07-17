import Svg, { Path, SvgProps } from 'react-native-svg';

export const DefaultUserIcon = (props: SvgProps) => {
  //   const { colorScheme } = useColorScheme();

  return (
    <Svg width={12} height={12} fill="none" {...props}>
      <Path
        stroke="#707070"
        d="M6 5.763a1.905 1.905 0 1 0 0-3.81 1.905 1.905 0 0 0 0 3.81ZM2.428 10.287V8.382l1.43-1.429L6 7.667l2.143-.714L9.57 8.382v1.905"
      />
    </Svg>
  );
};
