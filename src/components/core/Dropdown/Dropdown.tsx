import {
  CSSProperties,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import TextButton from '../Button/TextButton';
import colors from '../colors';

type Props = {
  mainText?: string;
  shouldCloseOnMenuItemClick?: boolean;
  children?: ReactNode;
};

const refContainsEventTarget = (ref: RefObject<HTMLDivElement>, event: MouseEvent) =>
  ref.current?.contains(event.target as Node);

const dropdownMenuWrapperStyle: CSSProperties = { position: 'relative' };
const dropdownButtonWrapperStyle: CSSProperties = { display: 'flex' };

function Dropdown({ mainText, shouldCloseOnMenuItemClick = false, children }: Props) {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleDropdownButtonClick = useCallback(() => {
    setIsDropdownVisible((previousIsDropdownVisible) => !previousIsDropdownVisible);
  }, []);

  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLDivElement>(null);

  const handleDocumentClick = useCallback(
    (event: MouseEvent) => {
      const clickedOutsideMenu = !refContainsEventTarget(dropdownMenuRef, event);
      const clickedOnButton = refContainsEventTarget(dropdownButtonRef, event);

      if (clickedOutsideMenu && !clickedOnButton) {
        setIsDropdownVisible(false);
      }
      if (!clickedOutsideMenu && shouldCloseOnMenuItemClick) {
        // without this timeout, the menu would immediately close and prevent the
        // underlying child element's `onClick` from triggering
        setTimeout(() => {
          setIsDropdownVisible(false);
        }, 200);
      }
    },
    [shouldCloseOnMenuItemClick]
  );

  useEffect(() => {
    // We only need to add document listener if dropdown is open
    if (isDropdownVisible) {
      document.addEventListener('mousedown', handleDocumentClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [handleDocumentClick, isDropdownVisible]);

  return (
    <StyledDropdown>
      {/* styled component type doesnt support refs so use wrapper */}
      <div ref={dropdownButtonRef} style={dropdownButtonWrapperStyle}>
        <StyledDropdownButton
          text={mainText ?? ''}
          onClick={handleDropdownButtonClick}
          isDropdownVisible={isDropdownVisible}
        />
      </div>
      <div ref={dropdownMenuRef} style={dropdownMenuWrapperStyle}>
        <StyledDropdownBox isDropdownVisible={isDropdownVisible}>{children}</StyledDropdownBox>
      </div>
    </StyledDropdown>
  );
}

type StyledDropdownProps = {
  isDropdownVisible: boolean;
};

const StyledDropdown = styled.div`
  display: flex;
  flex-direction: column;
  z-index: 1;
`;

export const StyledDropdownButton = styled(TextButton)<StyledDropdownProps>`
  width: fit-content;

  text-decoration: ${({ isDropdownVisible }) => (isDropdownVisible ? 'underline' : 'inherit')};

  &:focus {
    underline: 1px solid;
  }

  > p {
    color: ${({ isDropdownVisible }) => (isDropdownVisible ? 'black' : undefined)};
  }
`;

const StyledDropdownBox = styled.div<StyledDropdownProps>`
  visibility: ${({ isDropdownVisible }) => (isDropdownVisible ? 'visible' : 'hidden')};

  display: flex;
  flex-direction: column;
  align-items: flex-end;

  margin-top: 8px;

  position: absolute;
  right: 0;

  z-index: 1;

  padding: 12px;
  border: 1px solid ${colors.metal};
  width: auto;
  background-color: ${colors.white};
`;

export default Dropdown;
