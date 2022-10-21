import styled from 'styled-components';
import { TitleL, BaseM } from 'components/core/Text/Text';
import { ButtonLink } from 'components/core/Button/Button';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import { GALLERY_DISCORD, GALLERY_TWITTER } from 'constants/urls';
import { ROUTES } from 'constants/routes';

import { VStack } from 'components/core/Spacer/Stack';

type Props = {
  resource?: string;
};

function NotFound({ resource = 'user' }: Props) {
  return (
    <StyledNotFound gap={32}>
      <VStack gap={16} align="center">
        <TitleL>404</TitleL>
        <StyledBody>
          The {resource} doesn&apos;t exist. If you think this is a bug, tag us on{' '}
          <GalleryLink href={GALLERY_TWITTER}>@GALLERY</GalleryLink> or find us on{' '}
          <GalleryLink href={GALLERY_DISCORD}>Discord</GalleryLink>.
        </StyledBody>
      </VStack>
      <ButtonLink href={ROUTES.ROOT}>Take me back</ButtonLink>
    </StyledNotFound>
  );
}

const StyledNotFound = styled(VStack)`
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
