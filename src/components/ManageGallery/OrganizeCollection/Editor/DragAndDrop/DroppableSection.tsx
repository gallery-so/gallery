import { AnimateLayoutChanges, defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { VStack } from '~/components/core/Spacer/Stack';
import {
  useActiveSectionIdState,
  useCollectionEditorActions,
} from '~/contexts/collectionEditor/CollectionEditorContext';
import PlusIcon from '~/icons/PlusIcon';

import { Section } from './Section';

type Props = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  columns?: number;
  id: string;
  items: Array<{ id: string }>;
};

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

export default function DroppableSection({ children, columns, id, items, style, ...props }: Props) {
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const { attributes, isDragging, listeners, setNodeRef, transition, transform } = useSortable({
    id,
    data: {
      type: 'container',
      children: itemIds,
    },
    animateLayoutChanges,
  });

  const { setActiveSectionIdState, addSection, deleteSection } = useCollectionEditorActions();

  // Set section as active on mousedown instead of on click so that starting to drag an item immediately activates that section
  const handleMouseDown = useCallback(() => {
    setActiveSectionIdState(id);
  }, [id, setActiveSectionIdState]);

  const activeSectionId = useActiveSectionIdState();
  const isActive = activeSectionId === id;

  const handleAddSectionClick = useCallback(() => {
    addSection();
  }, [addSection]);

  const handleDeleteSectionClick = useCallback(() => {
    deleteSection(id, itemIds);
  }, [deleteSection, id, itemIds]);

  return (
    <>
      <VStack gap={6} align="center" onMouseDown={handleMouseDown}>
        <VStack gap={12} align="center">
          <Section
            ref={setNodeRef}
            style={{
              ...style,
              transition,
              transform: CSS.Translate.toString(transform),
              opacity: isDragging ? 0.5 : undefined,
            }}
            draggableAttributes={attributes}
            draggableListeners={listeners}
            columns={columns}
            {...props}
            isActive={isActive}
            isEmpty={items.length === 0}
            handleDeleteSectionClick={handleDeleteSectionClick}
          >
            {children}
          </Section>
          {isActive && !isDragging && (
            <StyledAddSectionButton onClick={handleAddSectionClick}>
              <StyledPlusIcon />
            </StyledAddSectionButton>
          )}
        </VStack>
      </VStack>
    </>
  );
}

const StyledAddSectionButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  height: 20px;
  width: 20px;
  border: 0;
  color: ${colors.white};
  background-color: ${colors.activeBlue};
  cursor: pointer;
`;

const StyledPlusIcon = styled(PlusIcon)``;
