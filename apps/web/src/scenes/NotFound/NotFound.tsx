import styled from 'styled-components';

import { ButtonLink } from '~/components/core/Button/Button';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
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
          <InteractiveLink href={GALLERY_TWITTER}>@GALLERY</InteractiveLink> or find us on{' '}
          <InteractiveLink href={GALLERY_DISCORD}>Discord</InteractiveLink>.
        </StyledBody>
      </VStack>
      <ButtonLink href={{ pathname: '/' }}>Take me back</ButtonLink>
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
