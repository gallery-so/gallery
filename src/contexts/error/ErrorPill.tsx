import { BodyRegular } from 'components/core/Text/Text';
import { useCallback } from 'react';
import styled from 'styled-components';

type Props = {
  message: string;
  onClose?: () => void;
};

const noop = () => {};

// Error pill that appears on top right corner of page
export function CornerErrorPill({ message, onClose = noop }: Props) {
  return (
    <CornerPosition>
      <ErrorPill message={message} onClose={onClose} />
    </CornerPosition>
  );
}

const CornerPosition = styled.div`
    z-index: 2; // appears above navbar
    position: fixed;
    top: 24px;
    right: 24px;
`;

function ErrorPill({ message, onClose }: Props) {
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <StyledErrorPill>
      <StyledClose onClick={handleClose}>&#x2715;</StyledClose>
      <BodyRegular>{message}</BodyRegular>
    </StyledErrorPill>
  );
}

const StyledErrorPill = styled.div`
    position: relative;
    border: 1px solid black;
    padding: 16px 32px 16px 24px;
    width: 288px;
    background: white;
`;

const StyledClose = styled.span`
  position: absolute;
  right: 6px;
  top: 7px;
  padding: 10px;
  cursor: pointer;
`;

export default ErrorPill;

