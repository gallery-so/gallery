import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import colors from '~/shared/theme/colors';

type Props = {
  checked: boolean;
  isPending?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Toggle({ checked, isPending, onChange, ...inputProps }: Props) {
  return (
    <IconContainer
      variant="transparent"
      disableHoverPadding
      size="md"
      icon={
        <StyledToggle disabled={isPending}>
          <StyledInput
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={isPending}
            {...inputProps}
          />
          <StyledToggleContainer active={checked}>
            <StyledTogglePill active={checked} />
          </StyledToggleContainer>
        </StyledToggle>
      }
    />
  );
}

const StyledToggle = styled.div<{ disabled?: boolean }>`
  position: relative;
  display: inline-block;
`;

const StyledToggleContainer = styled.div<{ active: boolean }>`
  border: 1px solid ${({ active }) => (active ? colors.activeBlue : colors.black['800'])};
  height: 12px;
  width: 12px;
  display: flex;
  border-radius: 20px;
  width: 22px;
  align-items: center;
  padding: 0 1px;
  position: relative;
  justify-content: ${({ active }) => (active ? 'flex-end' : 'flex-start')};
`;

const StyledTogglePill = styled.div<{ active: boolean }>`
  height: 8px;
  width: 8px;
  border-radius: 20px;
  border: 1px solid ${({ active }) => (active ? colors.activeBlue : colors.black['800'])};
`;

const StyledInput = styled.input`
  opacity: 0;
  height: 12px;
  position: absolute;
  width: 22px;
  z-index: 1;
  margin: 0;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;

    + ${StyledToggleContainer} {
      border-color: ${colors.porcelain};

      ${StyledTogglePill} {
        border-color: ${colors.porcelain};
      }
    }
  }
`;
