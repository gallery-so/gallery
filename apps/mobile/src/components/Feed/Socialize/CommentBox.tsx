import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import { useCallback, useLayoutEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import useKeyboardStatus from 'src/utils/useKeyboardStatus';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { useMentionableMessageActions } from '~/contexts/MentionableMessageContext';
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
  const { setMessage, parsedMessage } = useMentionableMessageActions();

  const characterCount = useMemo(() => 300 - parsedMessage.length, [parsedMessage]);

  const isKeyboardActive = useKeyboardStatus();

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  const resetComment = useCallback(() => {
    setMessage('');
  }, [setMessage]);

  const showXMark = useMemo(() => {
    // If its coming from comment button, show the x mark
    if (!isNotesModal) return true;

    // If not, check the KeyboardActive
    return isKeyboardActive;
  }, [isKeyboardActive, isNotesModal]);

  const handleSubmit = useCallback(() => {
    if (parsedMessage.length === 0) {
      return;
    }

    onSubmit(parsedMessage);

    resetComment();
  }, [onSubmit, resetComment, parsedMessage]);

  const disabledSendButton = useMemo(() => {
    return parsedMessage.length === 0 || characterCount < 0 || isSubmittingComment;
  }, [parsedMessage.length, characterCount, isSubmittingComment]);

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
    <View className="p-2 flex flex-row items-center space-x-3 border-t border-porcelain dark:border-black-500">
      <Animated.View className="flex-1 flex-row justify-between items-center bg-faint dark:bg-black-800 p-1.5 space-x-3">
        <BottomSheetTextInput
          value={parsedMessage}
          onChangeText={setMessage}
          className="text-sm h-5"
          selectionColor={colorScheme === 'dark' ? colors.white : colors.black['800']}
          autoCapitalize="none"
          autoComplete="off"
          autoFocus={autoFocus}
          onBlur={handleDismiss}
          placeholder="Add a comment..."
          placeholderTextColor={colorScheme === 'dark' ? colors.shadow : colors.metal}
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
