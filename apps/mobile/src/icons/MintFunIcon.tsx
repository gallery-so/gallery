import Svg, { Path, SvgProps } from 'react-native-svg';

type Props = {
  height?: number;
  width?: number;
} & SvgProps;

const originalWidth = 25;
const originalHeight = 22;

export function MintFunIcon({ width = originalWidth, height = originalHeight, ...props }: Props) {
  const scaledWidth = (height * originalWidth) / originalHeight;
  const scaledHeight = (width * originalHeight) / originalWidth;

  return (
    <Svg width={scaledWidth} height={scaledHeight} fill="none" {...props} viewBox="0 0 22 22">
      <Path
        fill="#7348F6"
        fillRule="evenodd"
        d="M.5 1.299A.8.8 0 0 1 1.302.5h19.77a.8.8 0 0 1 .801.799v1.197a.668.668 0 1 1-1.335 0 .668.668 0 0 0-.669-.665h-1.202a.8.8 0 0 0-.8.798v1.2c0 .367.298.665.667.665a.666.666 0 1 1 0 1.33H2.637a.8.8 0 0 0-.802.8v13.044a.8.8 0 0 0 .802.799h17.099a.8.8 0 0 0 .802-.799v-6.522a.668.668 0 1 1 1.335 0V21a.8.8 0 0 1-.802.799H1.301a.798.798 0 0 1-.801-.8v-19.7Zm1.335 1.33c0-.44.36-.798.802-.798h13.091a.8.8 0 0 1 .802.798v1.066a.8.8 0 0 1-.802.799H2.638a.8.8 0 0 1-.803-.799V2.63Zm20.05 2.414c-.218-.629-1.108-.629-1.327 0l-.438 1.265a.702.702 0 0 1-.434.432l-1.27.437a.698.698 0 0 0 0 1.322l1.27.436c.204.07.364.23.434.433l.438 1.265c.219.629 1.109.629 1.327 0l.439-1.265a.7.7 0 0 1 .434-.432l1.27-.437a.698.698 0 0 0 0-1.322l-1.27-.436a.699.699 0 0 1-.434-.433l-.439-1.265Z"
        clipRule="evenodd"
      />
      <Path
        fill="#7348F6"
        d="M16.217 10.103v.395c0 .27.219.49.49.49h.156c.27 0 .488.218.488.489v6.05c0 .27-.218.49-.488.49h-2.38a.488.488 0 0 1-.488-.49v-5.481a.49.49 0 0 0-.488-.49h-.6a.489.489 0 0 0-.487.49v5.48c0 .271-.218.49-.489.49H9.567a.488.488 0 0 1-.487-.49v-5.48a.49.49 0 0 0-.49-.49h-.613a.489.489 0 0 0-.49.49v5.48c0 .271-.217.49-.487.49H4.635a.487.487 0 0 1-.489-.49v-7.424c0-.27.219-.489.49-.489H15.73a.49.49 0 0 1 .487.49Z"
      />
    </Svg>
  );
}
