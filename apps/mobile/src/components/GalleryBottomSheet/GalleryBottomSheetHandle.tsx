import { useColorScheme, View } from 'react-native';

export function GalleryBottomSheetHandle() {
  const colorScheme = useColorScheme();

  return (
    <View
      className={`rounded-t-[40px] ${
        colorScheme === 'dark' ? 'bg-black  border-offBlack' : 'bg-white border-porcelain'
      }`}
    >
      <View className="space-y-2 py-3">
        <View className="h-1 w-20 self-center bg-[#D9D9D9] px-4 rounded-full" />
      </View>
    </View>
  );
}
