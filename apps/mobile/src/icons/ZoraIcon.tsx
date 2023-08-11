import Svg, {
  ClipPath,
  Defs,
  G,
  Mask,
  Path,
  RadialGradient,
  Rect,
  Stop,
  SvgProps,
} from 'react-native-svg';

export function ZoraIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} fill="none" {...props}>
      <G clipPath="url(#a)">
        <Mask id="b" width={16} height={17} x={0} y={-1} maskUnits="userSpaceOnUse">
          <Path fill="#D9D9D9" d="M8 15.998a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
        </Mask>
        <G mask="url(#b)">
          <Path fill="#A1723A" d="M18.711-3.48h-21.18V17.7h21.18V-3.48Z" />
          <G filter="url(#c)">
            <Path
              fill="#531002"
              d="M8.611 15.662a8.535 8.535 0 1 0 0-17.069 8.536 8.536 0 1 0 0 17.069Z"
            />
          </G>
          <G filter="url(#d)">
            <Path
              fill="#2B5DF0"
              d="M9.531 12.96a6.925 6.925 0 0 0 6.924-6.926 6.925 6.925 0 1 0-13.848 0c0 3.826 3.1 6.927 6.924 6.927Z"
            />
          </G>
          <G filter="url(#e)">
            <Path
              fill="url(#f)"
              d="M9.405 13.357a7.22 7.22 0 0 0 7.219-7.221 7.22 7.22 0 1 0-14.437 0 7.22 7.22 0 0 0 7.218 7.22Z"
            />
          </G>
          <G filter="url(#g)">
            <Path
              fill="#FCB8D4"
              d="M10.603 7.954a3.636 3.636 0 1 0 0-7.273 3.636 3.636 0 0 0 0 7.273Z"
            />
          </G>
          <G filter="url(#h)">
            <Path
              fill="#fff"
              d="M10.6 5.767a1.452 1.452 0 1 0 0-2.904 1.452 1.452 0 0 0 0 2.904Z"
            />
          </G>
          <G filter="url(#i)">
            <Path
              fill="url(#j)"
              fillOpacity={0.9}
              d="M9.635 18.814c7.207 0 13.05-5.843 13.05-13.05 0-7.206-5.843-13.048-13.05-13.048-7.206 0-13.049 5.842-13.049 13.049 0 7.206 5.843 13.049 13.05 13.049Z"
            />
          </G>
        </G>
      </G>
      <Defs>
        <RadialGradient
          id="f"
          cx={0}
          cy={0}
          r={1}
          gradientTransform="rotate(128.228 4.317 4.627) scale(13.6326 13.6315)"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0.286} stopColor="#387AFA" />
          <Stop offset={0.648} stopColor="#387AFA" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient
          id="j"
          cx={0}
          cy={0}
          r={1}
          gradientTransform="rotate(90 1.935 7.7) scale(13.0489)"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0.599} stopOpacity={0} />
          <Stop offset={0.672} />
          <Stop offset={0.734} stopOpacity={0} />
        </RadialGradient>
        <ClipPath id="a">
          <Rect width={16} height={16} fill="#fff" rx={8} />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
