import { useFocusEffect } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { useCallback, useState } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';

import colors from '~/shared/theme/colors';

import { XMarkIcon } from '../../icons/XMarkIcon';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Typography } from '../Typography';
import { useSearchContext } from './SearchContext';
import { SearchFilterType } from './SearchFilter';

type Props = TextInputProps & {
  inputRef: React.RefObject<TextInput>;
  setFilter: (filter: SearchFilterType) => void;
};

export function SearchInput({ inputRef, setFilter, value, onChange, style, ...props }: Props) {
  const { keyword, setKeyword } = useSearchContext();
  const [localKeyword, setLocalKeyword] = useState<string>(keyword);

  const [isFocused, setIsFocused] = useState(false);

  const setFocus = useCallback(() => {
    // Need to focus after a certain number of ms, otherwise the input immediately loses focus
    // https://github.com/facebook/react-native/issues/30162#issuecomment-1046090316
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);
  }, [inputRef]);

  useFocusEffect(setFocus);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleClear = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.clear();
      setKeyword('');
      setLocalKeyword('');
    }
  }, [inputRef, setKeyword]);

  const handleCancel = useCallback(() => {
    handleClear();
    setFilter('top');
    if (inputRef.current) {
      inputRef.current.blur();
    }
  }, [handleClear, inputRef, setFilter]);

  const handleChange = useCallback(
    (text: string) => {
      setKeyword(text);
      setLocalKeyword(text);
    },
    [setKeyword]
  );

  const { colorScheme } = useColorScheme();

  return (
    <View className="flex flex-row items-center space-x-[0px]">
      <TextInput
        ref={inputRef}
        className="text-black-800 dark:text-white h-10 flex-1 text-xxl"
        value={localKeyword}
        returnKeyType="done"
        onChangeText={handleChange}
        placeholder="Search for anything..."
        placeholderTextColor={colors.metal}
        selectionColor={colorScheme === 'dark' ? colors.offWhite : colors.black['800']}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {localKeyword.length > 0 && (
        <GalleryTouchableOpacity
          eventElementId={null}
          eventName={null}
          eventContext={null}
          accessibilityRole="button"
          onPress={handleClear}
          className="-m-4 p-4"
        >
          <View className="f flex h-4 w-4 items-center justify-center">
            <XMarkIcon />
          </View>
        </GalleryTouchableOpacity>
      )}
      {isFocused && (
        <GalleryTouchableOpacity
          eventElementId={null}
          eventName={null}
          eventContext={null}
          accessibilityRole="button"
          onPress={handleCancel}
          className="-m-4 p-4"
        >
          <Typography
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
            className="border-b border-black text-sm"
          >
            Cancel
          </Typography>
        </GalleryTouchableOpacity>
      )}
    </View>
  );
}
