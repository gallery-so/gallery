import { DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { CSSProperties, forwardRef, ReactNode } from 'react';
import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeM } from '~/components/core/Text/Text';
import transitions from '~/components/core/transitions';
import ColumnAdjuster from '~/components/GalleryEditor/CollectionEditor/ColumnAdjuster';
import DragHandleIcon from '~/icons/DragHandleIcon';
import { TrashIconNew } from '~/icons/TrashIconNew';
import colors from '~/shared/theme/colors';
import { noop } from '~/shared/utils/noop';

interface Props {
  id: string;
  children: ReactNode;
  columns?: number;
  label?: string;
  style?: CSSProperties;
  hover?: boolean;
  draggableAttributes?: DraggableAttributes;
  draggableListeners?: SyntheticListenerMap;
  isActive?: boolean;
  onClick?(): void;
  onRemove?(): void;
  isDragging?: boolean;
  isEmpty?: boolean;
  handleDeleteSectionClick?(): void;
}

type HandleProps = {
  isActive: boolean;
  isDragging: boolean;
};

export const Handle = forwardRef<HTMLButtonElement, HandleProps>((props, ref) => {
  return (
    <StyledLabel
      // @ts-expect-error force overload
      ref={ref}
      cursor="grab"
      data-cypress="draggable-handle"
      {...props}
    >
      <DragHandleIcon />
    </StyledLabel>
  );
});

Handle.displayName = 'Handle';

const StyledLabel = styled.div<{ isActive: boolean; isDragging: boolean }>`
  display: flex;
  background-color: ${colors.activeBlue};
  border-radius: 2px;
  padding: 2px 4px;
  align-items: center;
  user-select: none;

  cursor: ${({ isDragging }) => (isDragging ? 'grabbing' : 'grab')};
`;

export const Section = forwardRef<HTMLDivElement, Props>(
  (
    {
      id,
      children,
      columns,
      draggableListeners,
      draggableAttributes,
      onClick,
      style,
      isActive,
      isDragging = false,
      isEmpty = true,
      handleDeleteSectionClick = noop,
    }: Props,
    ref
  ) => {
    return (
      <StyledSection
        ref={ref}
        style={
          {
            ...style,
            '--columns': columns,
          } as React.CSSProperties
        }
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
        isActive={isActive || isDragging}
      >
        <StyledButtonContainer isActive={isActive || isDragging}>
          <Handle
            isActive={isActive || isDragging}
            isDragging={isDragging}
            {...draggableListeners}
            {...draggableAttributes}
          />

          <HStack gap={2}>
            <ColumnAdjuster sectionId={id} />
            <StyledDeleteButton onClick={handleDeleteSectionClick}>
              <IconContainer size="xs" variant="blue" icon={<TrashIconNew />} />
            </StyledDeleteButton>
          </HStack>
        </StyledButtonContainer>
        <StyledItemContainer columns={columns}>
          {isEmpty ? (
            <StyledEmptySectionMessage>
              <TitleDiatypeM>Select the pieces you’d like to add</TitleDiatypeM>
            </StyledEmptySectionMessage>
          ) : (
            children
          )}
        </StyledItemContainer>
      </StyledSection>
    );
  }
);

Section.displayName = 'Section';

const StyledButtonContainer = styled.div<{ isActive: boolean }>`
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 2px;

  opacity: ${({ isActive }) => (isActive ? '1' : '0')};
  transition: opacity ${transitions.cubic};
`;

const StyledSection = styled.div<{ isActive: boolean }>`
  display: flex;
  width: 830px;
  flex-direction: column;
  box-sizing: border-box;
  appearance: none;
  outline: none;
  min-width: 350px;
  border: 1px solid ${({ isActive }) => (isActive ? colors.activeBlue : 'transparent')};
  background: ${colors.white};
  transition: border ${transitions.cubic};
  cursor: pointer;
  border-radius: 2px;

  &:hover {
    border: 1px solid ${colors.activeBlue};
    ${StyledButtonContainer} {
      opacity: 1;
    }
  }
`;

const StyledItemContainer = styled.div<{ columns: number | undefined }>`
  display: flex;
  flex-wrap: wrap;
  padding: 0 12px 12px;
  ${({ columns }) => columns === 1 && `justify-content: center;`}
`;

const StyledEmptySectionMessage = styled.div`
  margin: auto;
  padding-bottom: 12px;
  width: 220px;
  text-align: center;
`;

const StyledDeleteButton = styled.button`
  background-color: ${colors.activeBlue};
  border: 0;
  border-radius: 2px;
  padding: 2px;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;
