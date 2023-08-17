import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import useKeyboardStatus from 'src/utils/useKeyboardStatus';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import colors from '~/shared/theme/colors';

import { SendIcon } from './SendIcon';

type Props = {
  onClose: () => void;
  autoFocus?: boolean;

  onSubmit: (value: string) => void;
  isSubmittingComment: boolean;

  // If its coming from comment button, show the x mark
  isNotesModal?: boolean;
};

export function CommentBox({
  autoFocus,
  onClose,
  isNotesModal = false,
  onSubmit,
  isSubmittingComment,
}: Props) {
  const { colorScheme } = useColorScheme();
  const [value, setValue] = useState('');

  const characterCount = useMemo(() => 100 - value.length, [value]);

  const isKeyboardActive = useKeyboardStatus();

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  const resetComment = useCallback(() => {
    setValue('');
  }, []);

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

  return (
    <View className="px-2 pb-2 flex flex-row items-center space-x-3">
      <Animated.View className="flex-1 flex-row justify-between items-center bg-faint dark:bg-black-800 p-1.5 space-x-3">
        <BottomSheetTextInput
          value={value}
          onChangeText={setValue}
          className="text-sm h-5"
          selectionColor={colorScheme === 'dark' ? colors.white : colors.black['800']}
          autoCapitalize="none"
          autoComplete="off"
          autoFocus={autoFocus}
          onBlur={handleDismiss}
          onSubmitEditing={handleDismiss}
          keyboardAppearance={colorScheme}
          style={{ flex: 1, color: colorScheme === 'dark' ? colors.white : colors.black['800'] }}
        />
        <Text className="text-sm text-metal">{characterCount}</Text>
        <GalleryTouchableOpacity
          eventElementId="Submit Comment Button"
          eventName="Submit Comment Button Clicked"
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
