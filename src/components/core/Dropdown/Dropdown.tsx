import {
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
  mainText: string;
  children?: ReactNode;
};

const refContainsEventTarget = (ref: RefObject<HTMLDivElement>, event: any) => {
  return ref.current && !ref.current.contains(event.target);
};

function Dropdown({ mainText, children }: Props) {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleClick = useCallback(() => {
    setIsDropdownVisible(!isDropdownVisible);
  }, [isDropdownVisible]);

  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleDocumentClick(event: any) {
      if (!isDropdownVisible) {
        return;
      }

      const clickedOutsideMenu = refContainsEventTarget(dropdownMenuRef, event);
      const clickedOnButton = !refContainsEventTarget(dropdownButtonRef, event);

      if (clickedOutsideMenu && !clickedOnButton) {
        setIsDropdownVisible(false);
      }
    }

    // we only need to add document listener if dropdown is open
    if (isDropdownVisible) {
      document.addEventListener('mousedown', handleDocumentClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [dropdownMenuRef, isDropdownVisible]);

  return (
    <StyledDropdown>
      <div
        style={{ width: 'fit-content', alignSelf: 'flex-end' }}
        ref={dropdownButtonRef}
      >
        <StyledDropdownButton text={mainText} onClick={handleClick} />
      </div>
      <div ref={dropdownMenuRef} style={{ position: 'relative' }}>
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
  border: 1px solid ${colors.black};
  padding: 10px;
  position: absolute;
  right: 0;
  width: max-content;
`;

const StyledDropdownButton = styled(TextButton)`
  width: fit-content;
  align-self: flex-end;

  &:focus {
    underline: 1px solid;
  }
`;

export default Dropdown;
