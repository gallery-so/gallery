import colors from 'components/core/colors';
import { TitleDiatypeM } from 'components/core/Text/Text';
import { forwardRef } from 'react';
import styled from 'styled-components';

export interface Props {
  children: React.ReactNode;
  columns?: number;
  label?: string;
  style?: React.CSSProperties;
  horizontal?: boolean;
  hover?: boolean;
  handleProps?: React.HTMLAttributes<any>;
  scrollable?: boolean;
  shadow?: boolean;
  placeholder?: boolean;
  unstyled?: boolean;
  isActive?: boolean;
  onClick?(): void;
  onRemove?(): void;
  isDragging?: boolean;
  isEmpty?: boolean;
}
type HandleProps = {
  label: string;
  isActive: boolean;
  isDragging: boolean;
};

export const Handle = forwardRef<HTMLButtonElement, HandleProps>((props, ref) => {
  return (
    <StyledLabel ref={ref} cursor="grab" data-cypress="draggable-handle" {...props}>
      <StyledLabelText>{props.label}</StyledLabelText>
    </StyledLabel>
  );
});
export const Section = forwardRef<HTMLDivElement, Props>(
  (
    {
      children,
      columns = 1,
      handleProps,
      onClick,
      label,
      style,
      isActive,
      isDragging = false,
      isEmpty = true,
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
      >
        <StyledLabelWrapper>
          <Handle
            label={label || ''}
            isActive={isActive || isDragging}
            isDragging={isDragging}
            {...handleProps}
          ></Handle>
        </StyledLabelWrapper>
        <StyledItemContainer isActive={isActive || isDragging}>
          {isEmpty ? (
            <StyledEmptySectionMessage>
              <TitleDiatypeM>Select the NFTs you’d like to add to this section</TitleDiatypeM>
            </StyledEmptySectionMessage>
          ) : (
            children
          )}
        </StyledItemContainer>
      </StyledSection>
    );
  }
);

const StyledSection = styled.div`
  display: flex;
  // max-width: 564px;
  width: 830px; // TODO change
  flex-direction: column;
  box-sizing: border-box;
  appearance: none;
  outline: none;
  min-width: 350px;
`;

const StyledLabel = styled.div<{ isActive: boolean; isDragging: boolean }>`
  background-color: ${({ isActive }) => (isActive ? colors.activeBlue : colors.porcelain)};
  border-radius: 2px;
  padding: 2px 4px;
  width: fit-content;
  margin-bottom: 6px;
  cursor: ${({ isDragging }) => (isDragging ? 'grabbing' : 'grab')};
`;

const StyledLabelWrapper = styled.div`
  display: flex;
`;

const StyledLabelText = styled(TitleDiatypeM)`
  color: ${colors.white};
`;

const StyledItemContainer = styled.div<{ isActive: boolean }>`
  background: ${colors.white};
  border: 1px solid ${({ isActive }) => (isActive ? colors.activeBlue : colors.porcelain)};
  display: flex;
  flex-wrap: wrap;
  padding: 24px;
  border-radius: 2px;
  cursor: pointer;
`;

const StyledEmptySectionMessage = styled.div`
  margin: auto;
`;
