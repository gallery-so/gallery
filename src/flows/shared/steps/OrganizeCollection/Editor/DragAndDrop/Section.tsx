import colors from 'components/core/colors';
import { TitleDiatypeM } from 'components/core/Text/Text';
import { CSSProperties, forwardRef } from 'react';
import styled from 'styled-components';
import SortableStagedNft from '../SortableStagedNft';
import SortableStagedWhitespace from '../SortableStagedWhitespace';

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
  onClick?(): void;
  onRemove?(): void;
}
interface ActionProps extends React.HTMLAttributes<HTMLButtonElement> {
  active?: {
    fill: string;
    background: string;
  };
  cursor?: CSSProperties['cursor'];
}

export const Action = forwardRef<HTMLButtonElement, Props>(
  ({ active, cursor, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        // className={classNames(styles.Action, className)}
        tabIndex={0}
        style={
          {
            ...style,
            cursor,
            '--fill': active?.fill,
            '--background': active?.background,
          } as CSSProperties
        }
      />
    );
  }
);

export const Handle = forwardRef<HTMLButtonElement, ActionProps>((props, ref) => {
  return (
    <Action ref={ref} cursor="grab" data-cypress="draggable-handle" {...props}>
      <svg viewBox="0 0 20 20" width="12">
        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
      </svg>
    </Action>
  );
});
export const Section = forwardRef<HTMLDivElement, Props>(
  (
    {
      children,
      columns = 1,
      handleProps,
      horizontal,
      hover,
      onClick,
      onRemove,
      label,
      placeholder,
      style,
      scrollable,
      shadow,
      unstyled,
      ...props
    }: Props,
    ref
  ) => {
    const Component = onClick ? 'button' : 'div';
    // const { itemWidth, dndWidth } = useDndWidth();
    // console.log(styles);
    console.log({ style });
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
          <StyledLabel>
            <StyledLabelText>{label}</StyledLabelText>
          </StyledLabel>
          <div>
            {/* {onRemove ? <Remove onClick={onRemove} /> : undefined} */}
            <Handle {...handleProps} />
          </div>
        </StyledLabelWrapper>
        <StyledItems>{children}</StyledItems>
      </StyledSection>
    );
  }
);

const StyledSection = styled.div`
  display: flex;
  // max-width: 564px;
  width: 664px; // TODO change
  flex-direction: column;
  // grid-auto-rows: max-content;
  // overflow: hidden;
  box-sizing: border-box;
  appearance: none;
  outline: none;
  min-width: 350px;
  margin: 10px;

  // min-height: 200px;
  transition: background-color 350ms ease;
  // background-color: rgba(246, 246, 246, 1);
  font-size: 1em;
`;

const StyledLabel = styled.div`
  background-color: ${colors.activeBlue};
  border-radius: 2px;
  padding: 2px 4px;
  width: fit-content;
  margin-bottom: 6px;
`;

const StyledLabelWrapper = styled.div`
  display: flex;
`;

const StyledLabelText = styled(TitleDiatypeM)`
  color: ${colors.white};
`;

const StyledItems = styled.div`
  border: 1px solid ${colors.activeBlue};
  display: flex;
  flex-wrap: wrap;
  padding: 24px;
  border-radius: 2px;
`;
