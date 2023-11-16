import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import React, { forwardRef, useCallback, useEffect } from 'react';
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
} from 'react-native';

import { MentionDataType } from '~/shared/hooks/useMentionableMessage';
import colors from '~/shared/theme/colors';

import ProcessedText from './ProcessedText/ProcessedText';

interface MentionTextInputProps extends TextInputProps {
  style?: TextInputProps['style'];
  mentions: MentionDataType[];
}

const MentionTextInput = forwardRef<TextInput, MentionTextInputProps>((props, ref) => {
  const { colorScheme } = useColorScheme();

  const { shouldHandleKeyboardEvents } = useBottomSheetInternal();

  const { onFocus, onBlur, value, mentions, ...rest } = props;

  //   Replicate how bottom sheet works - https://github.com/gorhom/react-native-bottom-sheet/blob/master/src/components/bottomSheetTextInput/BottomSheetTextInput.tsx
  useEffect(() => {
    return () => {
      // Reset the flag on unmount
      shouldHandleKeyboardEvents.value = false;
    };
  }, [shouldHandleKeyboardEvents]);

  const handleOnFocus = useCallback(
    (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
      shouldHandleKeyboardEvents.value = true;
      if (onFocus) {
        onFocus(args);
      }
    },
    [onFocus, shouldHandleKeyboardEvents]
  );

  const handleOnBlur = useCallback(
    (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
      shouldHandleKeyboardEvents.value = false;
      if (onBlur) {
        onBlur(args);
      }
    },
    [onBlur, shouldHandleKeyboardEvents]
  );

  return (
    <TextInput
      {...rest}
      ref={ref}
      onFocus={handleOnFocus}
      onBlur={handleOnBlur}
      multiline
      numberOfLines={1}
      style={{
        flex: 1,
        color: colorScheme === 'dark' ? colors.white : colors.black['800'],
        height: 20,
      }}
    >
      <ProcessedText text={value ?? ''} mentionsInText={mentions} />
    </TextInput>
  );
});

export default MentionTextInput;
