import styled from 'styled-components';
import { useModal } from 'contexts/modal/ModalContext';
import { useCallback, useRef } from 'react';

function SigninButton() {
  const { showModal } = useModal();

  const ModalContentRef = useRef(<div>connect your wallet</div>);

  const handleClick = useCallback(() => {
    showModal(ModalContentRef.current);
  }, [showModal]);

  return <StyledButton onClick={handleClick}>Sign In</StyledButton>;
}

const StyledButton = styled.button`
  padding: 8px 16px;
  border-style: none;
  text-transform: uppercase;
  background: black;
  color: white;
`;

export default SigninButton;
