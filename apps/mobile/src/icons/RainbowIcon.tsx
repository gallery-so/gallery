import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, RadialGradient, Stop, SvgProps } from 'react-native-svg';

export function RainbowIcon(props: SvgProps) {
  return (
    <View className="w-6 h-6 rounded-full items-center justify-center border-2 border-white dark:border-black-800 bg-[#001E59]">
      <Svg width={13} height={13} fill="none" {...props}>
        <Path
          fill="url(#a)"
          d="M.943 3.445h.834a7.778 7.778 0 0 1 7.777 7.778v.833h1.667c.46 0 .834-.373.834-.833C12.055 5.546 7.453.945 1.777.945a.833.833 0 0 0-.834.833v1.667Z"
        />
        <Path fill="url(#b)" d="M9.832 11.223h2.222c0 .46-.373.833-.833.833H9.832v-.833Z" />
        <Path fill="url(#c)" d="M1.777.945v2.222H.943V1.778c0-.46.373-.833.834-.833Z" />
        <Path
          fill="url(#d)"
          d="M.943 3.167h.834a8.056 8.056 0 0 1 8.055 8.056v.833h-2.5v-.833a5.556 5.556 0 0 0-5.555-5.556H.943v-2.5Z"
        />
        <Path fill="url(#e)" d="M7.61 11.223h2.222v.833H7.609v-.833Z" />
        <Path fill="url(#f)" d="M.943 5.39V3.166h.834v2.222H.943Z" />
        <Path
          fill="url(#g)"
          d="M.943 6.778c0 .46.373.833.834.833a3.611 3.611 0 0 1 3.61 3.612c0 .46.374.833.834.833H7.61v-.833a5.833 5.833 0 0 0-5.833-5.834H.943v1.39Z"
        />
        <Path fill="url(#h)" d="M5.389 11.223H7.61v.833H6.222a.833.833 0 0 1-.833-.833Z" />
        <Path fill="url(#i)" d="M1.777 7.611a.833.833 0 0 1-.834-.833V5.39h.834v2.222Z" />
        <Defs>
          <RadialGradient
            id="a"
            cx={0}
            cy={0}
            r={1}
            gradientTransform="rotate(-90 6.5 4.723) scale(10.2778)"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset={0.77} stopColor="#FF4000" />
            <Stop offset={1} stopColor="#8754C9" />
          </RadialGradient>
          <RadialGradient
            id="d"
            cx={0}
            cy={0}
            r={1}
            gradientTransform="rotate(-90 6.5 4.723) scale(8.05556)"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset={0.724} stopColor="#FFF700" />
            <Stop offset={1} stopColor="#FF9901" />
          </RadialGradient>
          <RadialGradient
            id="g"
            cx={0}
            cy={0}
            r={1}
            gradientTransform="rotate(-90 6.5 4.723) scale(5.83333)"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset={0.595} stopColor="#0AF" />
            <Stop offset={1} stopColor="#01DA40" />
          </RadialGradient>
          <RadialGradient
            id="h"
            cx={0}
            cy={0}
            r={1}
            gradientTransform="matrix(2.36111 0 0 6.2963 5.25 11.64)"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#0AF" />
            <Stop offset={1} stopColor="#01DA40" />
          </RadialGradient>
          <RadialGradient
            id="i"
            cx={0}
            cy={0}
            r={1}
            gradientTransform="matrix(0 -2.36111 44.7737 0 1.36 7.75)"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#0AF" />
            <Stop offset={1} stopColor="#01DA40" />
          </RadialGradient>
          <LinearGradient
            id="b"
            x1={9.693}
            x2={12.054}
            y1={11.639}
            y2={11.639}
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#FF4000" />
            <Stop offset={1} stopColor="#8754C9" />
          </LinearGradient>
          <LinearGradient
            id="c"
            x1={1.36}
            x2={1.36}
            y1={0.945}
            y2={3.306}
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#8754C9" />
            <Stop offset={1} stopColor="#FF4000" />
          </LinearGradient>
          <LinearGradient
            id="e"
            x1={7.609}
            x2={9.832}
            y1={11.639}
            y2={11.639}
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#FFF700" />
            <Stop offset={1} stopColor="#FF9901" />
          </LinearGradient>
          <LinearGradient
            id="f"
            x1={1.36}
            x2={1.36}
            y1={5.389}
            y2={3.167}
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#FFF700" />
            <Stop offset={1} stopColor="#FF9901" />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
}
