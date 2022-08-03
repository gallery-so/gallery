import { UniqueIdentifier } from '@dnd-kit/core';
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
  // disabled: boolean;
  style?: React.CSSProperties;
  columns?: number;
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
}: Props & {
  id: UniqueIdentifier;
  items: any[];
  style?: React.CSSProperties;
  label: string;
}) {
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const { active, attributes, isDragging, listeners, over, setNodeRef, transition, transform } =
    useSortable({
      id,
      data: {
        type: 'container',
        children: itemIds,
      },
      animateLayoutChanges,
    });

  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== 'container') || itemIds.includes(over.id)
    : false;

  const { setActiveSectionIdState } = useCollectionEditorActions();

  const handleClick = useCallback(() => {
    setActiveSectionIdState(id);
  }, [id, setActiveSectionIdState]);

  const activeSectionId = useActiveSectionIdState();
  const isActive = activeSectionId === id;

  return (
    // Set section as active onMouseDown instead of onClick so that dragging an item immediately activates that section
    <StyledSectionWrapper onMouseDown={handleClick}>
      <Section
        ref={setNodeRef}
        style={{
          ...style,
          transition,
          transform: CSS.Translate.toString(transform),
          opacity: isDragging ? 0.5 : undefined,
        }}
        hover={isOverContainer}
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
