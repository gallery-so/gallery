import Svg, { ClipPath, Defs, G, Path, SvgProps } from 'react-native-svg';

export function TopMemberBadgeIcon(props: SvgProps) {
  return (
    <Svg width={24} height={24} fill="none" {...props}>
      <G clipPath="url(#a)">
        <Path fill="#0022F0" d="m17.06 13.34 3.44 6.16H17l-1.5 3-3.5-6-3.5 6-1.5-3H3.5l3.44-6.16" />
        <Path
          stroke="#FEFEFE"
          d="m17.06 13.34 3.44 6.16H17l-1.5 3-3.5-6-3.5 6-1.5-3H3.5l3.44-6.16"
        />
        <Path fill="#0022F0" stroke="#FEFEFE" d="M12 15.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
        <Path
          fill="#FEFEFE"
          d="M14.447 9.67c0-.745.113-.937.553-.97v-.406h-3.157v.405c1.071.046 1.635-.081 1.635.847l.004 1.481a1.916 1.916 0 0 1-.24.528c-.23.338-.614.496-1.132.496-1.228 0-1.954-1.296-1.954-3.528s.67-3.56 2.01-3.56c1.037 0 1.661.685 1.82 2.128h.462V4.643h-.44c-.056.282-.101.361-.203.361-.18 0-.68-.504-1.683-.504C10.24 4.5 9 6.187 9 8.565c0 2.4 1.185 3.956 3.132 3.956h.004c1.148 0 1.515-.767 1.593-1.01l.275.908h.44l.003-2.75Z"
        />
      </G>
      <Defs>
        <ClipPath id="a">
          <Path fill="#fff" d="M0 .5h24v23H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
