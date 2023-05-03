import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { Keyboard, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useFragment } from 'react-relay';
import { XMarkIcon } from 'src/icons/XMarkIcon';
import useKeyboardStatus from 'src/utils/useKeyboardStatus';

import { IconContainer } from '~/components/IconContainer';
import { Typography } from '~/components/Typography';
import { RemainingAdmireCountFragment$key } from '~/generated/RemainingAdmireCountFragment.graphql';
import { RemainingAdmireCountQueryFragment$key } from '~/generated/RemainingAdmireCountQueryFragment.graphql';

import { CommentBox } from './CommentBox';
import { NotesList } from './NotesModal/NotesList';

type Props = {
  remainingCount: number;
  eventRef: RemainingAdmireCountFragment$key;
  queryRef: RemainingAdmireCountQueryFragment$key;
};

export function RemainingAdmireCount({ remainingCount, eventRef, queryRef }: Props) {
  const event = useFragment(
    graphql`
      fragment RemainingAdmireCountFragment on FeedEvent {
        ...NotesListFragment
        ...CommentBoxFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment RemainingAdmireCountQueryFragment on Query {
        ...CommentBoxQueryFragment
      }
    `,
    queryRef
  );

  const colorScheme = useColorScheme();
  const isKeyboardActive = useKeyboardStatus();
  const { bottom } = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [380], []);

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

  const handleOpen = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const handleCloseCommentBox = useCallback(() => {
    Keyboard.dismiss();

    // Reset the bottom sheet to the initial snap point
    bottomSheetRef.current?.expand();
  }, []);

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  if (remainingCount === 0) {
    return null;
  }

  return (
    <>
      <TouchableOpacity onPress={handleOpen}>
        <Typography className="text-xs underline" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          + {remainingCount} others
        </Typography>
      </TouchableOpacity>
      <View>
        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          handleComponent={() => (
            <View
              className={`h-2 border-t rounded-t-[40px] ${
                colorScheme === 'dark' ? 'bg-black border-offBlack' : 'bg-white border-porcelain'
              }`}
            >
              <View className="space-y-2 py-3">
                <View className="h-1 w-20 self-center bg-[#D9D9D9] px-4" />
              </View>
            </View>
          )}
        >
          <Animated.View
            className="flex justify-between flex-1 bg-white dark:bg-black pt-6"
            style={paddingStyle}
          >
            <View className="px-4">
              <IconContainer size="sm" icon={<XMarkIcon height={10} />} onPress={handleClose} />
            </View>
            <View className="pt-4 flex-1">
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
    </>
  );
}
