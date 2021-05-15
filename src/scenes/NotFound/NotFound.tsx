import { memo } from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import styled from 'styled-components';
import { Display, BodyRegular } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';

function NotFound(_: RouteComponentProps) {
  return (
    <StyledNotFound>
      <Display>404</Display>
      <BodyRegular>
        Looks like you took a wrong turn. There's not much to see here.
      </BodyRegular>
      <Link to="/">
        <Button>Take me back</Button>
      </Link>
    </StyledNotFound>
  );
}

const StyledNotFound = styled.div`
  text-align: center;
`;

export default memo(NotFound);
