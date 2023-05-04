import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useRef } from 'react';

import { NotesModalFragment$key } from '~/generated/NotesModalFragment.graphql';
import { NotesModalQueryFragment$key } from '~/generated/NotesModalQueryFragment.graphql';

import { NotesModal } from './NotesModal';

export function useNotesModal(
  eventRef: NotesModalFragment$key,
  queryRef: NotesModalQueryFragment$key
) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const handleOpen = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const notesModal = (
    <NotesModal eventRef={eventRef} queryRef={queryRef} bottomSheetRef={bottomSheetRef} />
  );

  return { handleOpen, notesModal };
}
