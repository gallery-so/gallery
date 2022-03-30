import styled from 'styled-components';
import { TitleL, BodyRegular } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import Page from 'components/core/Page/Page';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';

function NotFound() {
  return (
    <Page centered>
      <TitleL>404</TitleL>
      <Spacer height={16} />
      <StyledBody>
        This user doesn&apos;t exist yet. If you think they should,
        <br />
        {'share their collection in a tweet and tag us '}
        <GalleryLink href="https://twitter.com/gallery">@GALLERY</GalleryLink>.
      </StyledBody>
      <Spacer height={32} />
      <GalleryLink to="/">
        <StyledButton text="Take me back" />
      </GalleryLink>
    </Page>
  );
}

const StyledBody = styled(BodyRegular)`
  white-space: pre-wrap;
  text-align: center;
`;

const StyledButton = styled(Button)`
  padding: 0px 24px;
`;

export default NotFound;
