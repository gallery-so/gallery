import { useCallback, useRef } from 'react';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { NotesModalFragment$key } from '~/generated/NotesModalFragment.graphql';
import { NotesModalQueryFragment$key } from '~/generated/NotesModalQueryFragment.graphql';

import { NotesModal } from './NotesModal';

export function useNotesModal(
  eventRef: NotesModalFragment$key,
  queryRef: NotesModalQueryFragment$key
) {
  const bottomSheetRef = useRef<GalleryBottomSheetModalType>(null);

  const handleOpen = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const notesModal = (
    <NotesModal eventRef={eventRef} queryRef={queryRef} bottomSheetRef={bottomSheetRef} />
  );

  return { handleOpen, notesModal };
}
