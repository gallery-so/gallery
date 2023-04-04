import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

import { useSearchContext } from './SearchContext';
import { XMarkIcon } from './XMarkIcon';

type Props = TextInputProps;

export function SearchInput({ value, onChange, style, ...props }: Props) {
  const { keyword, setKeyword } = useSearchContext();
  const [localKeyword, setLocalKeyword] = useState<string>(keyword);

  const ref = useRef<TextInput>(null);

  useFocusEffect(() => {
    // Need to focus after a certain number of ms, otherwise the input immediately loses focus
    // https://github.com/facebook/react-native/issues/30162#issuecomment-1046090316
    setTimeout(() => {
      if (ref.current) {
        ref.current.focus();
      }
    }, 500);
  });

  const handleClear = useCallback(() => {
    if (ref.current) {
      ref.current.clear();
    }
  }, []);

  const handleChange = useCallback(
    (text: string) => {
      setKeyword(text);
      setLocalKeyword(text);
    },
    [setKeyword]
  );

  return (
    <View className="flex flex-row items-center">
      <TextInput
        ref={ref}
        className="text-offBlack flex-1 py-2 text-xl"
        value={localKeyword}
        returnKeyType="done"
        onChangeText={handleChange}
        {...props}
      />
      <TouchableOpacity className="p-2" accessibilityRole="button" onPress={handleClear}>
        <XMarkIcon />
      </TouchableOpacity>
    </View>
  );
}
