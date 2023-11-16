import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useEffect } from 'react';
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
} from 'react-native';

import { MentionDataType } from '~/shared/hooks/useMentionableMessage';

import MentionTextInput from '../MentionTextInput';

interface MentionTextInputProps extends TextInputProps {
  style?: TextInputProps['style'];
  mentions: MentionDataType[];
}

const GalleryBottomSheetMentionTextInput = forwardRef<TextInput, MentionTextInputProps>(
  (props, ref) => {
    const { shouldHandleKeyboardEvents } = useBottomSheetInternal();

    const { onFocus, onBlur, ...rest } = props;

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

    return <MentionTextInput ref={ref} {...rest} onFocus={handleOnFocus} onBlur={handleOnBlur} />;
  }
);

export default GalleryBottomSheetMentionTextInput;
