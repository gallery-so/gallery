import { useCallback, useState } from 'react';
import styled from 'styled-components';
import TextButton from '../Button/TextButton';
import colors from '../colors';
import Link from '../Link/Link';

// dropdown input vs dropdown menu

type Props = {
  mainText: string;
  options: Array<DropdownOption>;
};

type DropdownOption = {
  label: string;
  value: string;
};

function Dropdown({ mainText, options }: Props) {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const handleClick = useCallback(() => {
    setIsDropdownVisible(!isDropdownVisible);
  }, [isDropdownVisible]);

  return (
    <StyledDropdown>
      <StyledDropdownButton text={mainText} onClick={handleClick} />
      <StyledDropdownMenu isDropdownVisible={isDropdownVisible}>
        {options.map((option: DropdownOption) => {
          return <StyledDrodownOption>{option.label}</StyledDrodownOption>;
        })}
      </StyledDropdownMenu>
    </StyledDropdown>
  );
}

type StyledDropdownMenuProps = {
  isDropdownVisible: boolean;
};

const StyledDropdown = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
`;

const StyledDropdownButton = styled(TextButton)`
  width: fit-content;
  align-self: flex-end;
  &:focus {
    text-decoration: underline;
  }
`;

const StyledDropdownMenu = styled.div<StyledDropdownMenuProps>`
  visibility: ${({ isDropdownVisible }) =>
    isDropdownVisible ? 'visible' : 'hidden'};
  display: flex;

  flex-direction: column;
  align-items: flex-end;
  border: 1px solid ${colors.black};
  padding: 10px;
`;

const StyledDrodownOption = styled(Link)`
  padding-bottom: 8px;
`;

export default Dropdown;
