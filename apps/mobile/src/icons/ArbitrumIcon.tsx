import Svg, { Path, SvgProps } from 'react-native-svg';

export function ArbitrumIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <Path
        fill="#213147"
        d="M1.447 4.863v6.272c0 .4.214.771.56.97l5.432 3.137c.347.2.774.2 1.12 0l5.432-3.136c.347-.2.56-.57.56-.97V4.862c0-.4-.213-.77-.56-.97L8.56.756c-.346-.2-.773-.2-1.12 0L2.006 3.893c-.347.2-.56.57-.56.97Z"
      />
      <Path
        fill="#12AAFF"
        d="M9.184 9.216 8.41 11.34a.273.273 0 0 0 0 .183l1.332 3.655 1.542-.89-1.85-5.072a.133.133 0 0 0-.25 0ZM10.738 5.643a.133.133 0 0 0-.25 0l-.775 2.124a.273.273 0 0 0 0 .183l2.184 5.985 1.541-.89-2.7-7.402Z"
      />
      <Path
        fill="#9DCCED"
        d="M7.999.991c.038 0 .076.01.11.029l5.879 3.394c.068.04.11.113.11.19v6.787a.22.22 0 0 1-.11.19l-5.879 3.395a.217.217 0 0 1-.11.029.232.232 0 0 1-.11-.03l-5.879-3.39a.221.221 0 0 1-.11-.191V4.606a.22.22 0 0 1 .11-.19L7.89 1.02a.222.222 0 0 1 .11-.03Zm0-.991c-.209 0-.42.054-.607.163L1.515 3.555a1.212 1.212 0 0 0-.606 1.05v6.787c0 .434.23.834.606 1.05l5.879 3.395a1.22 1.22 0 0 0 1.213 0l5.878-3.394c.376-.217.607-.617.607-1.05V4.606c0-.434-.232-.834-.607-1.05L8.605.162A1.209 1.209 0 0 0 8 0Z"
      />
      <Path fill="#213147" d="m4.11 13.943.542-1.482 1.088.905-1.017.93-.612-.353Z" />
      <Path
        fill="#fff"
        d="M7.504 4.12h-1.49a.265.265 0 0 0-.25.175L2.57 13.052l1.541.89L7.63 4.3a.132.132 0 0 0-.125-.179ZM10.112 4.12h-1.49a.265.265 0 0 0-.25.175l-3.647 10 1.541.89 3.97-10.886a.133.133 0 0 0-.124-.179Z"
      />
    </Svg>
  );
}
