import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useLayoutEffect, useMemo } from 'react';
import { Keyboard, Pressable, useColorScheme, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useFragment } from 'react-relay';
import useKeyboardStatus from 'src/utils/useKeyboardStatus';

import { NotesModalFragment$key } from '~/generated/NotesModalFragment.graphql';
import { NotesModalQueryFragment$key } from '~/generated/NotesModalQueryFragment.graphql';

import { CommentBox } from '../CommentBox';
import { NotesList } from './NotesList';

type Props = {
  eventRef: NotesModalFragment$key;
  queryRef: NotesModalQueryFragment$key;
  bottomSheetRef: React.RefObject<BottomSheetModal>;
};

export function NotesModal({ eventRef, queryRef, bottomSheetRef }: Props) {
  const event = useFragment(
    graphql`
      fragment NotesModalFragment on FeedEvent {
        ...NotesListFragment
        ...CommentBoxFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment NotesModalQueryFragment on Query {
        ...CommentBoxQueryFragment
      }
    `,
    queryRef
  );

  const colorScheme = useColorScheme();

  const snapPoints = useMemo(() => [320], []);

  const isKeyboardActive = useKeyboardStatus();
  const { bottom } = useSafeAreaInsets();
  const paddingBottomValue = useSharedValue(isKeyboardActive ? 0 : bottom);
  const paddingStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: paddingBottomValue.value,
    };
  });

  useLayoutEffect(() => {
    if (isKeyboardActive) {
      paddingBottomValue.value = withSpring(0, { overshootClamping: true });
    } else {
      paddingBottomValue.value = withSpring(bottom, { overshootClamping: true });
    }
  }, [bottom, isKeyboardActive, paddingBottomValue]);

  const handleCloseCommentBox = useCallback(() => {
    Keyboard.dismiss();

    // Reset the bottom sheet to the initial snap point
    bottomSheetRef.current?.expand();
  }, [bottomSheetRef]);

  return (
    <View>
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        android_keyboardInputMode="adjustResize"
        backdropComponent={({ animatedIndex, ...props }) => (
          <BottomSheetBackdrop
            {...props}
            animatedIndex={animatedIndex}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.1}
          />
        )}
        backgroundStyle={{
          borderRadius: 40,
        }}
        handleComponent={() => (
          // Temporary workaround https://github.com/gorhom/react-native-bottom-sheet/issues/1351#issuecomment-1518718101
          <Pressable onPressIn={() => Keyboard.dismiss()}>
            <View
              className={`rounded-t-[40px] ${
                colorScheme === 'dark' ? 'bg-black  border-offBlack' : 'bg-white border-porcelain'
              }`}
            >
              <View className="space-y-2 py-3">
                <View className="h-1 w-20 self-center bg-[#D9D9D9] px-4 rounded-full" />
              </View>
            </View>
          </Pressable>
        )}
      >
        <Animated.View
          className="flex justify-between flex-1 bg-white dark:bg-black pt-2"
          style={paddingStyle}
        >
          <View className="pt-2 flex-1">
            <NotesList eventRef={event} />
          </View>
          <View
            className={`h-2 border-t ${
              colorScheme === 'dark' ? 'bg-black border-offBlack' : 'bg-white border-porcelain'
            }
            `}
          />
          <CommentBox
            eventRef={event}
            queryRef={query}
            onClose={handleCloseCommentBox}
            isNotesModal
          />
        </Animated.View>
      </BottomSheetModal>
    </View>
  );
}
