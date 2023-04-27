import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

import colors from '~/shared/theme/colors';

import { useSearchContext } from './SearchContext';
import { XMarkIcon } from './XMarkIcon';

type Props = TextInputProps;

export function SearchInput({ value, onChange, style, ...props }: Props) {
  const { keyword, setKeyword } = useSearchContext();
  const [localKeyword, setLocalKeyword] = useState<string>(keyword);

  const ref = useRef<TextInput>(null);

  const handleFocus = useCallback(() => {
    // Need to focus after a certain number of ms, otherwise the input immediately loses focus
    // https://github.com/facebook/react-native/issues/30162#issuecomment-1046090316
    setTimeout(() => {
      if (ref.current) {
        ref.current.focus();
      }
    }, 500);
  }, [ref]);

  useFocusEffect(handleFocus);

  const handleClear = useCallback(() => {
    if (ref.current) {
      ref.current.clear();
      setKeyword('');
    }
  }, [setKeyword]);

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
        className="text-offBlack dark:text-white h-10 flex-1 text-xl"
        value={localKeyword}
        returnKeyType="done"
        onChangeText={handleChange}
        placeholder="Search for anything..."
        placeholderTextColor={colors.metal}
        selectionColor="#141414"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        {...props}
      />
      {localKeyword.length > 0 && (
        <TouchableOpacity accessibilityRole="button" onPress={handleClear}>
          <View className="f flex h-4 w-4 items-center justify-center">
            <XMarkIcon />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
