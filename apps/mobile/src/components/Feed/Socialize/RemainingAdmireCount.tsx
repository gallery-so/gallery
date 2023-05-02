import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef } from 'react';
import { Keyboard, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useFragment } from 'react-relay';
import { XMarkIcon } from 'src/icons/XMarkIcon';
import useKeyboardStatus from 'src/utils/useKeyboardStatus';

import { IconContainer } from '~/components/IconContainer';
import { Typography } from '~/components/Typography';
import { RemainingAdmireCountFragment$key } from '~/generated/RemainingAdmireCountFragment.graphql';
import { RemainingAdmireCountQueryFragment$key } from '~/generated/RemainingAdmireCountQueryFragment.graphql';

import { CommentBox } from './CommentBox';
import { NotesModal } from './NotesModal/NotesModal';

type Props = {
  remainingCount: number;
  eventRef: RemainingAdmireCountFragment$key;
  queryRef: RemainingAdmireCountQueryFragment$key;
};

export function RemainingAdmireCount({ remainingCount, eventRef, queryRef }: Props) {
  const event = useFragment(
    graphql`
      fragment RemainingAdmireCountFragment on FeedEvent {
        ...NotesModalFragment
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

  const isKeyboardActive = useKeyboardStatus();
  const { bottom } = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [380], []);

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
            <View className="space-y-2 py-3">
              <View className="h-1 w-20 self-center bg-[#D9D9D9] px-4" />
            </View>
          )}
        >
          <View
            className="flex justify-between flex-1"
            style={{
              paddingBottom: isKeyboardActive ? 0 : bottom,
            }}
          >
            <View className="px-4">
              <IconContainer size="sm" icon={<XMarkIcon height={10} />} onPress={handleClose} />
            </View>
            <View className="pt-4 flex-1">
              <NotesModal eventRef={event} />
            </View>
            <View className="bg-white h-2 border-t border-porcelain" />
            <CommentBox
              eventRef={event}
              queryRef={query}
              onClose={handleCloseCommentBox}
              isNotesModal
            />
          </View>
        </BottomSheetModal>
      </View>
    </>
  );
}
