import styled from 'styled-components';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
import { GALLERY_DISCORD, GALLERY_TWITTER } from '~/constants/urls';

type Props = {
  name: string;
};

export default function CommunityPageDisabled({ name }: Props) {
  return (
    <StyledDisabledSection align="center" justify="center" gap={16}>
      <TitleDiatypeM>Coming Soon</TitleDiatypeM>

      <BaseM>
        We are working to enable community pages for individual projects under the {name} contract.
      </BaseM>
      <BaseM>
        Be the first to know when it's available by joining us on{' '}
        <GalleryLink href={GALLERY_DISCORD}>Discord</GalleryLink> or{' '}
        <GalleryLink href={GALLERY_TWITTER}>Twitter</GalleryLink>.
      </BaseM>
      <BaseM>
        <GalleryLink to={{ pathname: '/home' }}>Back to home</GalleryLink>
      </BaseM>
    </StyledDisabledSection>
  );
}

const StyledDisabledSection = styled(VStack)`
  margin-top: 20vh; // position a bit higher than the center

  text-align: center;
`;
