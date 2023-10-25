import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CSSProperties, ReactNode, useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { useCollectionEditorContext } from '~/contexts/collectionEditor/CollectionEditorContext';
import useKeyDown from '~/hooks/useKeyDown';
import PlusIcon from '~/icons/PlusIcon';
import colors from '~/shared/theme/colors';

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

export default function DroppableSection({ children, columns, id, items, style, ...props }: Props) {
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const { attributes, isDragging, listeners, setNodeRef, transition, transform } = useSortable({
    id,
    data: {
      type: 'container',
      children: itemIds,
    },
  });

  const {
    activeSectionId,
    activateSection,
    addSection,
    deleteSection,
    moveSectionUp,
    moveSectionDown,
  } = useCollectionEditorContext();

  const { step, dialogMessage, nextStep, handleClose } = useOnboardingDialogContext();

  // Set section as active on mousedown instead of on click so that starting to drag an item immediately activates that section
  const handleMouseDown = useCallback(() => {
    activateSection(id);
  }, [activateSection, id]);

  const isActive = activeSectionId === id;

  const handleAddSectionClick = useCallback(() => {
    addSection(id);
  }, [addSection, id]);

  const handleDeleteSectionClick = useCallback(() => {
    deleteSection(id);
  }, [deleteSection, id]);

  const handleArrowUp = useCallback(() => {
    if (id === activeSectionId) {
      moveSectionUp(activeSectionId);
    }
  }, [activeSectionId, id, moveSectionUp]);

  const handleArrowDown = useCallback(() => {
    if (id === activeSectionId) {
      moveSectionDown(activeSectionId);
    }
  }, [activeSectionId, id, moveSectionDown]);

  useKeyDown('ArrowUp', handleArrowUp);
  useKeyDown('ArrowDown', handleArrowDown);

  return (
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

              {step === 5 && (
                <OnboardingDialog
                  step={step}
                  text={dialogMessage}
                  onNext={nextStep}
                  onClose={handleClose}
                  options={{
                    blinkingPosition: {
                      left: 30,
                    },
                    positionOffset: 20,
                    placement: 'bottom',
                  }}
                />
              )}
            </StyledAddSectionButton>
          </HStack>
        )}
      </VStack>
    </VStack>
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
  position: relative;
`;

const StyledPlusIcon = styled(PlusIcon)``;
