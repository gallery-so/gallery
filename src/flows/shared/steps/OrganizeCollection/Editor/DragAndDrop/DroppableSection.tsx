import { UniqueIdentifier } from '@dnd-kit/core';
import { AnimateLayoutChanges, defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { Section } from './Section';
import { CSS } from '@dnd-kit/utilities';
import { useCallback } from 'react';
import {
  useActiveSectionIdState,
  useCollectionEditorActions,
} from 'contexts/collectionEditor/CollectionEditorContext';

type Props = {
  children: React.ReactNode;
  disabled: boolean;
  style?: React.CSSProperties;
  columns?: number;
};

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

export default function DroppableSection({
  children,
  columns = 2,
  disabled,
  id,
  items,
  style,
  ...props
}: Props & {
  disabled?: boolean;
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  style?: React.CSSProperties;
}) {
  const { active, attributes, isDragging, listeners, over, setNodeRef, transition, transform } =
    useSortable({
      id,
      data: {
        type: 'container',
        children: items,
      },
      animateLayoutChanges,
    });
  // const isOverContainer =

  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== 'container') || items.includes(over.id)
    : false;

  const { setActiveSectionIdState } = useCollectionEditorActions();

  const handleClick = useCallback(() => {
    setActiveSectionIdState(id);
  }, [id, setActiveSectionIdState]);

  const activeSectionId = useActiveSectionIdState();
  const isActive = activeSectionId === id;
  return (
    // <div>DroppableSection{children}</div>
    <Section
      onClick={handleClick}
      ref={disabled ? undefined : setNodeRef}
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
    >
      {children}
    </Section>
  );
}
