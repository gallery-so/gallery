import styled from 'styled-components';
import ActionText from '../ActionText/ActionText';
import Dropdown from './Dropdown';

type Props = {
  mainText: string;
  options: DropdownOption[];
};

type DropdownOption = {
  label: string;
  value: string;
};

function DropdownMenu({ mainText, options }: Props) {
  return (
    <Dropdown mainText={mainText}>
      {options.map((option: DropdownOption) => (
        <StyledLink key={option.value} href={option.value}>
          <StyledLinkText>{option.label}</StyledLinkText>
        </StyledLink>
      ))}
    </Dropdown>
  );
}

const StyledLink = styled.a`
  text-decoration: none;
`;

const StyledLinkText = styled(ActionText)`
  padding-bottom: 8px;
`;

export default DropdownMenu;
