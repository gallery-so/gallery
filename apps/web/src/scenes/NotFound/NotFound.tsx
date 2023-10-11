import styled from 'styled-components';

import { DeprecatedButtonLink } from '~/components/core/Button/Button';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleL } from '~/components/core/Text/Text';
import { GALLERY_DISCORD, GALLERY_TWITTER } from '~/constants/urls';

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
      <DeprecatedButtonLink href={{ pathname: '/' }}>Take me back</DeprecatedButtonLink>
    </StyledNotFound>
  );
}

const StyledNotFound = styled(VStack)`
  height: 100%;
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
