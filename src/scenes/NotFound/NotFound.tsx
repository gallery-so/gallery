import { Link } from '@reach/router';
import styled from 'styled-components';
import { Display, BodyRegular } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import Page from 'components/core/Page/Page';

function NotFound() {
  return (
    <Page centered>
      <Display>404</Display>
      <Spacer height={8} />
      <StyledBody>This user doesn't exist yet. If you think they should,<br/>share their collection in a tweet and tag us @usegallery.</StyledBody>
      <Spacer height={24} />
      <Link to="/">
        <StyledButton text="Take me back" />
      </Link>
    </Page>
  );
}

const StyledBody = styled(BodyRegular)`
  white-space: pre-wrap;;
  text-align: center;
`;

const StyledButton = styled(Button)`
  padding: 0px 24px;
`;

export default NotFound;
