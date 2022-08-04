import { AnimateLayoutChanges, defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { Section } from './Section';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useMemo } from 'react';
import {
  useActiveSectionIdState,
  useCollectionEditorActions,
} from 'contexts/collectionEditor/CollectionEditorContext';
import styled from 'styled-components';

type Props = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  columns?: number;
  id: string;
  items: any[];
  label: string;
};

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

export default function DroppableSection({
  children,
  columns = 2,
  id,
  items,
  style,
  ...props
}: Props) {
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const { attributes, isDragging, listeners, setNodeRef, transition, transform } = useSortable({
    id,
    data: {
      type: 'container',
      children: itemIds,
    },
    animateLayoutChanges,
  });

  const { setActiveSectionIdState } = useCollectionEditorActions();

  // Set section as active on mousedown instead of on click so that starting to drag an item immediately activates that section
  const handleMouseDown = useCallback(() => {
    setActiveSectionIdState(id);
  }, [id, setActiveSectionIdState]);

  const activeSectionId = useActiveSectionIdState();
  const isActive = activeSectionId === id;

  return (
    <StyledSectionWrapper onMouseDown={handleMouseDown}>
      <Section
        ref={setNodeRef}
        style={{
          ...style,
          transition,
          transform: CSS.Translate.toString(transform),
          opacity: isDragging ? 0.5 : undefined,
        }}
        handleProps={{
          ...attributes,
          ...listeners,
        }}
        columns={columns}
        {...props}
        isActive={isActive}
        isEmpty={items.length === 0}
      >
        {children}
      </Section>
    </StyledSectionWrapper>
  );
}

const StyledSectionWrapper = styled.div`
  margin: 10px;
`;
