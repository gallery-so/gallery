import { ReactNode } from 'react';
import styled from 'styled-components';
import Dropdown, { StyledDropdownButton } from './Dropdown';

type Props = {
  className?: string;
  children: ReactNode;
};

function SettingsDropdown({ children, className }: Props) {
  return (
    <StyledSettingsDropdown className={className}>
      <Dropdown>{children}</Dropdown>
    </StyledSettingsDropdown>
  );
}

const StyledSettingsDropdown = styled.div`
  background: url(/icons/ellipses.svg) no-repeat scroll 10px 9px;

  ${StyledDropdownButton} {
    width: 32px;
    height: 32px;
  }
`;

export default SettingsDropdown;
