import styled from 'styled-components';
import { TitleL, BaseM } from 'components/core/Text/Text';
import { ButtonLink } from 'components/core/Button/Button';
import DeprecatedSpacer from 'components/core/Spacer/DeprecatedSpacer';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import { GALLERY_DISCORD, GALLERY_TWITTER } from 'constants/urls';

type Props = {
  resource?: string;
};

function NotFound({ resource = 'user' }: Props) {
  return (
    <StyledNotFound>
      <TitleL>404</TitleL>
      <DeprecatedSpacer height={16} />
      <StyledBody>
        The {resource} doesn&apos;t exist. If you think this is a bug, tag us on{' '}
        <GalleryLink href={GALLERY_TWITTER}>@GALLERY</GalleryLink> or find us on{' '}
        <GalleryLink href={GALLERY_DISCORD}>Discord</GalleryLink>.
      </StyledBody>
      <DeprecatedSpacer height={32} />
      <ButtonLink href="/">Take me back</ButtonLink>
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

export default NotFound;
