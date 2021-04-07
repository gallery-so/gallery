import styled from 'styled-components';
import ActionText from '../ActionText/ActionText';
import Dropdown from './Dropdown';
type Props = {
  mainText: string;
  options: Array<DropdownOption>;
};

type DropdownOption = {
  label: string;
  value: string;
};

function DropdownMenu({ mainText, options }: Props) {
  return (
    <Dropdown mainText={mainText}>
      {options.map((option: DropdownOption) => {
        return <StyledDropdownMenuItem>{option.label}</StyledDropdownMenuItem>;
      })}
    </Dropdown>
  );
}

const StyledDropdownMenuItem = styled(ActionText)`
  padding-bottom: 8px;
`;

export default DropdownMenu;
