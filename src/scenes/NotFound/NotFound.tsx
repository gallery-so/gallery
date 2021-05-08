import { memo } from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import styled from 'styled-components';
import { Title } from 'components/core/Text/Text';

function NotFound(_: RouteComponentProps) {
  return (
    <StyledNotFound>
      <Title>NOT FOUND</Title>
      <Link to="/">go back home</Link>
    </StyledNotFound>
  );
}

const StyledNotFound = styled.div`
  text-align: center;
`;

export default memo(NotFound);
