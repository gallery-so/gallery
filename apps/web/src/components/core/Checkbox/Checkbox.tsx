import styled from 'styled-components';
import { v4 as uuid } from 'uuid';

import CheckIcon from '~/icons/CheckIcon';
import colors from '~/shared/theme/colors';

type Props = {
  checked: boolean;
  isPending?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Checkbox({ checked, label, isPending, onChange, ...inputProps }: Props) {
  // generate a unique id for the input
  const id = uuid();

  return (
    <>
      <StyledCheckbox>
        <StyledInput
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={isPending}
          id={id}
          {...inputProps}
        />
        <StyledCheckboxContainer active={checked}>
          {checked && <CheckIcon color={colors.activeBlue} />}
        </StyledCheckboxContainer>
      </StyledCheckbox>
      {label && <StyledLabel htmlFor={id}>{label}</StyledLabel>}
    </>
  );
}

const StyledCheckbox = styled.div`
  position: relative;
  display: inline-block;
`;

const StyledCheckboxContainer = styled.div<{ active: boolean }>`
  border: 1px solid ${({ active }) => (active ? colors.activeBlue : colors.offBlack)};
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

const StyledLabel = styled.label`
  width: 100%;
  cursor: pointer;
`;
