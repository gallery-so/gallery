import { View } from 'react-native';

export function PostEventSocializeSection() {
  return (
    <View className="flex flex-row px-3 justify-between pb-8 pt-5">
      <View className="flex-1 pr-4 pt-1">{/* <Interactions eventRef={event} /> */}</View>

      <View className="flex flex-row space-x-1">
        {/* <AdmireButton eventRef={event} queryRef={query} /> */}
        {/* <CommentButton eventRef={event} onClick={onCommentPress} /> */}
      </View>
    </View>
  );
}
