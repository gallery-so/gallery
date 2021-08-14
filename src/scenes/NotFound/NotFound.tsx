import { memo } from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import styled from 'styled-components';
import { Display, BodyRegular } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import Page from 'components/core/Page/Page';

function NotFound(_: RouteComponentProps) {
  return (
    <Page centered>
      <Display>404</Display>
      <Spacer height={8} />
      <BodyRegular>Unfortunately, there's not much to see here.</BodyRegular>
      <Spacer height={24} />
      <Link to="/">
        <StyledButton text="Take me back" />
      </Link>
    </Page>
  );
}

const StyledButton = styled(Button)`
  padding: 0px 24px;
`;

export default memo(NotFound);
