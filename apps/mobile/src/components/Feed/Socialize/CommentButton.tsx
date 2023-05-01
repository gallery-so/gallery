import { View, TouchableOpacity, ViewProps } from 'react-native';
import { CommentIcon } from './CommentIcon';

type Props = {
  style?: ViewProps['style'];
};

export function CommentButton({ style }: Props) {
  return (
    <View className="flex flex-row space-x-4" style={style}>
      <TouchableOpacity onPress={() => {}}>
        <CommentIcon />
      </TouchableOpacity>
    </View>
  );
}
