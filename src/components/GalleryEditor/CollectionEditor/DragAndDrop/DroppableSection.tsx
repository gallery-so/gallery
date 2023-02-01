import { AnimateLayoutChanges, defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CSSProperties, ReactNode, useCallback, useMemo } from 'react';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { useCollectionEditorContextNew } from '~/contexts/collectionEditor/CollectionEditorContextNew';
import PlusIcon from '~/icons/PlusIcon';

import OnboardingDialog from '../../GalleryOnboardingGuide/OnboardingDialog';
import { useOnboardingDialogContext } from '../../GalleryOnboardingGuide/OnboardingDialogContext';
import { Section } from './Section';

type Props = {
  children: ReactNode;
  style?: CSSProperties;
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

  const { activeSectionId, activateSection, addSection, deleteSection } =
    useCollectionEditorContextNew();

  const { step, dialogMessage, nextStep } = useOnboardingDialogContext();

  // Set section as active on mousedown instead of on click so that starting to drag an item immediately activates that section
  const handleMouseDown = useCallback(() => {
    activateSection(id);
  }, [activateSection, id]);

  const isActive = activeSectionId === id;

  const handleAddSectionClick = useCallback(() => {
    addSection();
  }, [addSection]);

  const handleDeleteSectionClick = useCallback(() => {
    deleteSection(id);
  }, [deleteSection, id]);

  return (
    <>
      <VStack gap={6} align="center" onMouseDown={handleMouseDown}>
        <VStack gap={12} align="center">
          <Section
            id={id}
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
            <HStack gap={8} align="center">
              <StyledAddSectionButton onClick={handleAddSectionClick}>
                <StyledPlusIcon />
              </StyledAddSectionButton>
              {step === 5 && (
                <OnboardingDialog step={step} text={dialogMessage} onNext={nextStep} />
              )}
            </HStack>
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
