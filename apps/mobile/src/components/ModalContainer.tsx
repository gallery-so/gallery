import { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ModalContainer({ children }: PropsWithChildren) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View className="flex h-full flex-col bg-white" style={{ paddingBottom: bottom }}>
      <View className="bg-white py-2">
        <View className="h-1 w-20 self-center bg-[#D9D9D9] px-4" />
      </View>
      <ScrollView className="px-4">{children}</ScrollView>
    </View>
  );
}
