import { useCallback, useEffect, useRef } from 'react';
import { TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

import { XMarkIcon } from './XMarkIcon';

type Props = TextInputProps;

export function SearchInput({ value, onChange, style, ...props }: Props) {
  const ref = useRef<TextInput>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  const handleClear = useCallback(() => {
    if (ref.current) {
      ref.current.clear();
    }
  }, []);

  return (
    <View className="flex flex-row items-center">
      <TextInput
        ref={ref}
        className=" text-offBlack flex-1 py-2 text-xl"
        value={value}
        {...props}
      />
      <TouchableOpacity className="p-2" accessibilityRole="button" onPress={handleClear}>
        <XMarkIcon />
      </TouchableOpacity>
    </View>
  );
}
