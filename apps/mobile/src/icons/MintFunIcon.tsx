import Svg, { ClipPath, Defs, G, Path, SvgProps } from 'react-native-svg';

type Props = {
  height?: number;
  width?: number;
} & SvgProps;

const originalWidth = 12;
const originalHeight = 19;

export function MintFunIcon({ width = originalWidth, height = originalHeight, ...props }: Props) {
  const scaledWidth = (height * originalWidth) / originalHeight;
  const scaledHeight = (width * originalHeight) / originalWidth;

  return (
    <Svg width={scaledWidth} height={scaledHeight} viewBox="0 0 12 19" fill="none" {...props}>
      <G clipPath="url(#a)">
        <Path
          fill="#7348F6"
          d="m8.591 14.682-.887 3.36c-.093.404-.498.731-.902.731H.828c-.405 0-.653-.326-.545-.731l.903-3.36c.093-.405.498-.732.902-.732h5.943c.404 0 .653.327.56.732Zm3.392-13.006L9.4 11.944a.698.698 0 0 1-.685.544H2.741c-.233 0-.45-.093-.575-.28-.125-.171-.25-.607.358-1.027l2.753-2.007c.296-.217.14-.684-.217-.684H1.45a.657.657 0 0 1-.544-.28C.75 8.039.703 7.805.75 7.603l1.587-6.285a.729.729 0 0 1 .7-.545h8.23c.233 0 .42.094.575.28.14.172.187.405.14.623Z"
        />
      </G>
      <Defs>
        <ClipPath id="a">
          <Path fill="#fff" d="M.252.773h11.746v18H.252z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
