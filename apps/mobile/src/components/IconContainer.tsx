import { ReactElement } from 'react';
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

type IconContainerProps = {
  className?: string;
  style?: TouchableOpacityProps['style'];
  icon: ReactElement;
  onPress: () => void;
};

export function IconContainer({ icon, onPress, style }: IconContainerProps) {
  return (
    <TouchableOpacity style={style} onPress={onPress}>
      <View className="bg-faint dark:bg-graphite h-7 w-7 items-center justify-center rounded-full">
        {icon}
      </View>
    </TouchableOpacity>
  );
}
