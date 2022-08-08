import colors from 'components/core/colors';
import { TitleDiatypeM } from 'components/core/Text/Text';
import transitions from 'components/core/transitions';
import { forwardRef } from 'react';
import styled from 'styled-components';

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
      <StyledLabelText>Section</StyledLabelText>
    </StyledLabel>
  );
});
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
        {/* <StyledLabelWrapper> */}
        <Handle isActive={isActive || isDragging} isDragging={isDragging} {...handleProps}></Handle>
        {/* </StyledLabelWrapper> */}
        <StyledItemContainer columns={columns}>
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
const StyledLabel = styled.div<{ isActive: boolean; isDragging: boolean }>`
  background-color: ${colors.activeBlue};
  border-radius: 2px;
  padding: 2px 4px;
  width: fit-content;
  margin-bottom: 6px;
  cursor: ${({ isDragging }) => (isDragging ? 'grabbing' : 'grab')};
  margin: 8px 8px 0;
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
    ${StyledLabel} {
      opacity: 1;
    }
  }
`;

const StyledLabelText = styled(TitleDiatypeM)`
  color: ${colors.white};
`;

const StyledItemContainer = styled.div<{ columns: number }>`
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
