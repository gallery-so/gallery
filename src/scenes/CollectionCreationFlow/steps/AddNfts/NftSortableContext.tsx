import { ReactNode } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { Nft } from 'types/Nft';

type Props = {
  children: ReactNode;
  nfts: Nft[];
  handleDragEnd: (event: DragEndEvent) => void;
};

export default function NftSortableContext({
  children,
  nfts,
  handleDragEnd,
}: Props) {
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={nfts}>{children}</SortableContext>
    </DndContext>
  );
}
