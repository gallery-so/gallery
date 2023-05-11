import { useCallback, useLayoutEffect, useMemo } from 'react';
import { Keyboard, Pressable, useColorScheme, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useFragment } from 'react-relay';
import useKeyboardStatus from 'src/utils/useKeyboardStatus';

import { GalleryBottomSheetHandle } from '~/components/GalleryBottomSheet/GalleryBottomSheetHandle';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { NotesModalFragment$key } from '~/generated/NotesModalFragment.graphql';
import { NotesModalQueryFragment$key } from '~/generated/NotesModalQueryFragment.graphql';

import { CommentBox } from '../CommentBox';
import { NotesList } from './NotesList';

type Props = {
  eventRef: NotesModalFragment$key;
  queryRef: NotesModalQueryFragment$key;
  bottomSheetRef: React.RefObject<GalleryBottomSheetModalType>;
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
      <GalleryBottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        android_keyboardInputMode="adjustResize"
        keyboardBlurBehavior="restore"
        handleComponent={Handle}
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
      </GalleryBottomSheetModal>
    </View>
  );
}

function Handle() {
  return (
    <Pressable onPressIn={() => Keyboard.dismiss()}>
      <GalleryBottomSheetHandle />
    </Pressable>
  );
}
