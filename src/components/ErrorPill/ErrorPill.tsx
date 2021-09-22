import { BodyRegular } from 'components/core/Text/Text';
import styled from 'styled-components';

type Props = {
  message: string;
};

export function FullPageErrorPill({ message }: Props) {
  return (
    <StyledFullPageErrorPill>
      <CornerPosition>
        <ErrorPill message={message} />
      </CornerPosition>
    </StyledFullPageErrorPill>
  );
}

const StyledFullPageErrorPill = styled.div`
      position: fixed;
      height: 100vh;
      width: 100vw;
  `;

const CornerPosition = styled.div`
      position: absolute;
      top: 24px;
      right: 24px;
  `;

function ErrorPill({ message }: Props) {
  return (
    <StyledErrorPill>
      <StyledClose>&#x2715;</StyledClose>
      <BodyRegular>{message}</BodyRegular>
    </StyledErrorPill>
  );
}

const StyledErrorPill = styled.div`
    position: relative;
    border: 1px solid black;
    padding: 16px 32px 16px 24px;
    width: 288px;
`;

const StyledClose = styled.span`
  position: absolute;
  right: 6px;
  top: 7px;
  padding: 10px;
  cursor: pointer;
`;

export default ErrorPill;

