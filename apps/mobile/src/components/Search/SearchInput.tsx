import { useEffect, useRef } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { XMarkIcon } from './XMarkIcon';

export function SearchInput({ ...props }) {
  const ref = useRef<TextInput>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return (
    <View className="flex flex-row items-center" {...props}>
      <TextInput ref={ref} className=" text-offBlack bg-red flex-1 py-2 text-xl" />
      <TouchableOpacity className="p-2" accessibilityRole="button" onPress={() => {}}>
        <XMarkIcon />
      </TouchableOpacity>
    </View>
  );
}
