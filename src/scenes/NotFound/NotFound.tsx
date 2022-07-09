import styled from 'styled-components';
import { TitleL, BaseM } from 'components/core/Text/Text';
import Button from 'components/core/Button/DeprecatedButton';
import Spacer from 'components/core/Spacer/Spacer';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import { GALLERY_DISCORD, GALLERY_TWITTER } from 'constants/urls';

type Props = {
  resource?: string;
};

function NotFound({ resource = 'user' }: Props) {
  return (
    <StyledNotFound>
      <TitleL>404</TitleL>
      <Spacer height={16} />
      <StyledBody>
        The {resource} doesn&apos;t exist. If you think this is a bug, tag us on{' '}
        <GalleryLink href={GALLERY_TWITTER}>@GALLERY</GalleryLink> or find us on{' '}
        <GalleryLink href={GALLERY_DISCORD}>Discord</GalleryLink>.
      </StyledBody>
      <Spacer height={32} />
      <GalleryLink to="/">
        <StyledButton text="Take me back" />
      </GalleryLink>
    </StyledNotFound>
  );
}

const StyledNotFound = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const StyledBody = styled(BaseM)`
  max-width: 300px;
  white-space: pre-wrap;
  text-align: center;
`;

const StyledButton = styled(Button)`
  padding: 0px 24px;
`;

export default NotFound;
