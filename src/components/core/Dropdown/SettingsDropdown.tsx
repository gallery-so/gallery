import { ReactNode, useCallback, useState } from 'react';
import styled from 'styled-components';

import { Dropdown } from '~/components/core/Dropdown/Dropdown';
import IconContainer, { ColorVariant, IconSize } from '~/components/core/Markdown/IconContainer';

type Props = {
  children: ReactNode;
  iconVariant: ColorVariant;
  size?: IconSize;
};

function SettingsDropdown({ children, iconVariant, size }: Props) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSettingsClick = useCallback(() => {
    setShowDropdown((previous) => !previous);
  }, []);

  const handleCloseSettingsDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  return (
    <StyledSettingsDropdown>
      <IconContainer
        variant={iconVariant}
        size={size}
        onClick={handleSettingsClick}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M9.33332 8.00001C9.33332 7.26363 8.73637 6.66667 7.99999 6.66667C7.26361 6.66667 6.66666 7.26363 6.66666 8.00001C6.66666 8.73638 7.26361 9.33334 7.99999 9.33334C8.73637 9.33334 9.33332 8.73638 9.33332 8.00001Z"
              stroke="#141414"
              strokeMiterlimit="10"
            />
            <path
              d="M14.6667 8.00001C14.6667 7.26363 14.0697 6.66667 13.3333 6.66667C12.597 6.66667 12 7.26363 12 8.00001C12 8.73638 12.597 9.33334 13.3333 9.33334C14.0697 9.33334 14.6667 8.73638 14.6667 8.00001Z"
              stroke="#141414"
              strokeMiterlimit="10"
            />
            <path
              d="M4.00001 8.00001C4.00001 7.26363 3.40306 6.66667 2.66668 6.66667C1.9303 6.66667 1.33334 7.26363 1.33334 8.00001C1.33334 8.73638 1.9303 9.33334 2.66668 9.33334C3.40306 9.33334 4.00001 8.73638 4.00001 8.00001Z"
              stroke="#141414"
              strokeMiterlimit="10"
            />
          </svg>
        }
      />

      <Dropdown position="right" active={showDropdown} onClose={handleCloseSettingsDropdown}>
        {children}
      </Dropdown>
    </StyledSettingsDropdown>
  );
}

const StyledSettingsDropdown = styled.div`
  position: relative;
`;

export default SettingsDropdown;
