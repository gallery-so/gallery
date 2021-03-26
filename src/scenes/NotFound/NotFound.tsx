import { memo } from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import styled from 'styled-components';

function NotFound(_: RouteComponentProps) {
  return (
    <StyledNotFound>
      <StyledHeader>NOT FOUND</StyledHeader>
      <Link to="/">go back home</Link>
    </StyledNotFound>
  );
}

const StyledNotFound = styled.div`
  text-align: center;
`;

const StyledHeader = styled.p`
  color: #7bfeff;
  font-size: 30px;
`;

export default memo(NotFound);
