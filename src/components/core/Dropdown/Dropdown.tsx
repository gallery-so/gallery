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
  children?: ReactNode;
};

const refContainsEventTarget = (
  ref: RefObject<HTMLDivElement>,
  event: MouseEvent
) => {
  return ref.current?.contains(event.target as Node);
};

const dropdownMenuWrapperStyle: CSSProperties = { position: 'relative' };
const dropdownButtonWrapperStyle: CSSProperties = { display: 'flex' };

function Dropdown({ mainText, children }: Props) {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleDropdownButtonClick = useCallback(() => {
    setIsDropdownVisible((prevIsDropdownVisible) => !prevIsDropdownVisible);
  }, []);

  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLDivElement>(null);

  const handleDocumentClick = useCallback((event: MouseEvent) => {
    const clickedOutsideMenu = !refContainsEventTarget(dropdownMenuRef, event);
    const clickedOnButton = refContainsEventTarget(dropdownButtonRef, event);

    if (clickedOutsideMenu && !clickedOnButton) {
      setIsDropdownVisible(false);
    }
  }, []);

  useEffect(() => {
    // we only need to add document listener if dropdown is open
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
          text={mainText || ''}
          onClick={handleDropdownButtonClick}
        />
      </div>
      <div ref={dropdownMenuRef} style={dropdownMenuWrapperStyle}>
        <StyledDropdownBox isDropdownVisible={isDropdownVisible}>
          {children}
        </StyledDropdownBox>
      </div>
    </StyledDropdown>
  );
}

type StyledDropdownBoxProps = {
  isDropdownVisible: boolean;
};

const StyledDropdown = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledDropdownBox = styled.div<StyledDropdownBoxProps>`
  visibility: ${({ isDropdownVisible }) =>
    isDropdownVisible ? 'visible' : 'hidden'};

  display: flex;
  flex-direction: column;
  align-items: flex-end;

  position: absolute;
  right: 0;

  padding: 10px;
  border: 1px solid ${colors.gray50};
  width: max-content;
  background-color: ${colors.white};

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
`;

export const StyledDropdownButton = styled(TextButton)`
  width: fit-content;
  // align-self: flex-end;

  &:focus {
    underline: 1px solid;
  }
`;

export default Dropdown;
