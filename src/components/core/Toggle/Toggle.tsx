import styled from 'styled-components';

import colors from '../colors';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function Toggle({ checked, onChange }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <StyledToggle>
      <StyledInput type="checkbox" checked={checked} onChange={handleChange} />
      <StyledToggleContainer active={checked}>
        <StyledTogglePill active={checked} />
      </StyledToggleContainer>
    </StyledToggle>
  );
}

const StyledToggle = styled.div`
  position: relative;
  display: inline-block;
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

const StyledToggleContainer = styled.div<{ active: boolean }>`
  border: 1px solid ${({ active }) => (active ? colors.activeBlue : colors.offBlack)};
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
  border: 1px solid ${({ active }) => (active ? colors.activeBlue : colors.offBlack)};
`;
