import colors from 'components/core/colors';
import { TitleDiatypeM } from 'components/core/Text/Text';
import transitions from 'components/core/transitions';
import { useCollectionEditorActions } from 'contexts/collectionEditor/CollectionEditorContext';
import { forwardRef, useCallback } from 'react';
import styled from 'styled-components';
import TrashIcon from 'src/icons/Trash';
import DragHandleIcon from 'src/icons/DragHandleIcon';

interface Props {
  children: React.ReactNode;
  columns?: number;
  label?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  handleProps?: React.HTMLAttributes<any>;
  isActive?: boolean;
  onClick?(): void;
  onRemove?(): void;
  isDragging?: boolean;
  isEmpty?: boolean;
  id: string;
  itemIds: string[];
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
      <StyledDragHangleIcon />
      <StyledLabelText>Section</StyledLabelText>
    </StyledLabel>
  );
});

const StyledLabel = styled.div<{ isActive: boolean; isDragging: boolean }>`
  display: flex;
  background-color: ${colors.activeBlue};
  border-radius: 2px;
  padding-right: 4px;
  align-items: center;
  width: fit-content;

  cursor: ${({ isDragging }) => (isDragging ? 'grabbing' : 'grab')};
`;

const StyledDragHangleIcon = styled(DragHandleIcon)`
  width: 20px;
`;

const StyledLabelText = styled(TitleDiatypeM)`
  color: ${colors.white};
`;

export const Section = forwardRef<HTMLDivElement, Props>(
  (
    {
      children,
      columns,
      handleProps,
      onClick,
      style,
      isActive,
      isDragging = false,
      isEmpty = true,
      id,
      itemIds,
    }: Props,
    ref
  ) => {
    const { deleteSection, setTokensIsSelected, unstageTokens } = useCollectionEditorActions();
    const handleDeleteSectionClick = useCallback(() => {
      setTokensIsSelected(itemIds, false);
      unstageTokens(itemIds);
      deleteSection(id);
    }, [deleteSection, id, itemIds, setTokensIsSelected, unstageTokens]);
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
          <Handle isActive={isActive || isDragging} isDragging={isDragging} {...handleProps} />
          <StyledDeleteButton onClick={handleDeleteSectionClick}>
            <StyledTrashIcon />
          </StyledDeleteButton>
        </StyledButtonContainer>
        <StyledItemContainer columns={columns}>
          {isEmpty ? (
            <StyledEmptySectionMessage>
              <TitleDiatypeM>Select the pieces you’d like to add to this section</TitleDiatypeM>
            </StyledEmptySectionMessage>
          ) : (
            children
          )}
        </StyledItemContainer>
      </StyledSection>
    );
  }
);

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
  width: 190px;
  text-align: center;
`;

const StyledDeleteButton = styled.button`
  height: 24px;
  width: 24px;
  background-color: ${colors.activeBlue};
  border: 0;
  border-radius: 2px;
  padding: 0;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const StyledTrashIcon = styled(TrashIcon)``;
