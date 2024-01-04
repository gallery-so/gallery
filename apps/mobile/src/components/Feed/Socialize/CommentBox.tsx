import { useColorScheme } from 'nativewind';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useCallback, useLayoutEffect, useMemo } from 'react';
import { NativeSyntheticEvent, Text, TextInputSelectionChangeEventData, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import {
  getRemaningCharacterCount,
  MAX_COMMENT_LENGTH,
} from 'shared/utils/getRemaningCharacterCount';
import useKeyboardStatus from 'src/utils/useKeyboardStatus';

import GalleryBottomSheetMentionTextInput from '~/components/GalleryBottomSheet/GalleryBottomSheetMentionTextInput';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { contexts } from '~/shared/analytics/constants';
import { MentionDataType } from '~/shared/hooks/useMentionableMessage';
import colors from '~/shared/theme/colors';

import { SendIcon } from './SendIcon';

type Props = {
  value: string;
  mentions: MentionDataType[];
  onChangeText: (value: string) => void;
  onSelectionChange: (selection: { start: number; end: number }) => void;

  onClose: () => void;
  autoFocus?: boolean;

  onSubmit: (value: string) => void;
  isSubmittingComment: boolean;

  placeholder?: string;

  // If its coming from comment button, show the x mark
  isNotesModal?: boolean;
};

export const CommentBox = forwardRef(
  (
    {
      value,
      onChangeText,
      onSelectionChange,
      autoFocus,
      onClose,
      isNotesModal = false,
      onSubmit,
      isSubmittingComment,
      placeholder = 'Add a comment...',
      mentions,
    }: Props,
    ref
  ) => {
    const { colorScheme } = useColorScheme();

    const characterCount = useMemo(
      () => getRemaningCharacterCount(value, MAX_COMMENT_LENGTH),
      [value]
    );

    const isKeyboardActive = useKeyboardStatus();

    const handleDismiss = useCallback(() => {
      onClose();
    }, [onClose]);

    const resetComment = useCallback(() => {
      onChangeText('');
    }, [onChangeText]);

    const showXMark = useMemo(() => {
      // If its coming from comment button, show the x mark
      if (!isNotesModal) return true;

      // If not, check the KeyboardActive
      return isKeyboardActive;
    }, [isKeyboardActive, isNotesModal]);

    const handleSubmit = useCallback(() => {
      if (value.length === 0) {
        return;
      }

      onSubmit(value);

      resetComment();
    }, [onSubmit, resetComment, value]);

    const disabledSendButton = useMemo(() => {
      return value.length === 0 || characterCount < 0 || isSubmittingComment;
    }, [value.length, characterCount, isSubmittingComment]);

    const width = useSharedValue(0);
    const display = useSharedValue('none');

    useLayoutEffect(() => {
      if (showXMark) {
        width.value = withSpring(20, { overshootClamping: true });
        display.value = 'flex';
      } else {
        width.value = withSpring(0, { overshootClamping: true });
        display.value = 'none';
      }
    }, [showXMark, width, display]);

    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    return (
      <View className="p-2 flex flex-row items-center space-x-3 border-t border-porcelain dark:border-black-500">
        <Animated.View className="flex-1 flex-row justify-between items-center bg-faint dark:bg-black-800 p-1.5 space-x-3">
          <GalleryBottomSheetMentionTextInput
            ref={inputRef}
            value={value}
            placeholder={placeholder}
            className="text-sm"
            onChangeText={onChangeText}
            onSelectionChange={(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
              onSelectionChange(e.nativeEvent.selection);
            }}
            autoFocus={autoFocus}
            selectionColor={colorScheme === 'dark' ? colors.white : colors.black['800']}
            autoComplete="off"
            onBlur={handleDismiss}
            placeholderTextColor={colorScheme === 'dark' ? colors.shadow : colors.metal}
            onSubmitEditing={handleDismiss}
            keyboardType="twitter"
            keyboardAppearance={colorScheme}
            style={{
              flex: 1,
              color: colorScheme === 'dark' ? colors.white : colors.black['800'],
              lineHeight: 18,
              paddingTop: 0,
            }}
            mentions={mentions}
          />

          <Text className="text-sm text-metal">{characterCount}</Text>
          <GalleryTouchableOpacity
            eventElementId="Submit Comment Button"
            eventName="Submit Comment Button Clicked"
            eventContext={contexts.Posts}
            onPress={handleSubmit}
            disabled={disabledSendButton}
          >
            <View
              className={`h-6 w-6 rounded-full flex items-center justify-center bg-red
            ${disabledSendButton ? 'bg-metal' : 'bg-activeBlue'}
        `}
            >
              <SendIcon />
            </View>
          </GalleryTouchableOpacity>
        </Animated.View>
      </View>
    );
  }
);
