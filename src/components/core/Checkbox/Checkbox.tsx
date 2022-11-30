import styled from 'styled-components';
import CheckIcon from '~/icons/CheckIcon';
import colors from '../colors';

type Props = {
  checked: boolean;
  isPending?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Checkbox({ checked, isPending, onChange, ...inputProps }: Props) {
  return (
    <StyledCheckbox>
      <StyledInput
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={isPending}
        {...inputProps}
      />
      <StyledCheckboxContainer>
        {checked && <CheckIcon color={colors.activeBlue} />}
      </StyledCheckboxContainer>
    </StyledCheckbox>
  );
}

const StyledCheckbox = styled.div`
  position: relative;
  display: inline-block;
`;

const StyledCheckboxContainer = styled.div`
  border: 1px solid blue;
  height: 12px;
  width: 12px;
  display: flex;
  align-items: center;
  padding: 0 1px;
  position: relative;
  justify-content: flex-end;
`;

const StyledInput = styled.input`
  opacity: 0;
  height: 12px;
  position: absolute;
  width: 22px;
  z-index: 1;
  margin: 0;
  cursor: pointer;
`;
