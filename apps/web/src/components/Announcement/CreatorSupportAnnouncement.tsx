import styled from 'styled-components';

import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';

import { Button } from '../core/Button/Button';
import GalleryLink from '../core/GalleryLink/GalleryLink';
import { VStack } from '../core/Spacer/Stack';
import { BaseM, TitleCondensed } from '../core/Text/Text';

type Props = {
  handleContinueCreatorBetaClick: () => void;
  eventContext: GalleryElementTrackingProps['eventContext'];
  eventFlow: GalleryElementTrackingProps['eventFlow'];
};

export default function CreatorSupportAnnouncement({
  handleContinueCreatorBetaClick,
  eventContext,
  eventFlow,
}: Props) {
  return (
    <StyledAnnouncement align="center" justify="center" gap={24}>
      <StyledTitle>Gallery for Creators is now in beta</StyledTitle>
      <BaseM>
        Welcome to our new creator support feature, currently in beta. Share and display works
        you’ve created on Gallery. Learn more about how it works in{' '}
        <GalleryLink href={'https://gallery.so'}>our FAQ here</GalleryLink>.
      </BaseM>
      <Button
        eventElementId="Creator Beta Announcement Continue Button"
        eventName="Clicked Continue on Creator Beta Announcement"
        eventContext={eventContext}
        eventFlow={eventFlow}
        variant="primary"
        onClick={handleContinueCreatorBetaClick}
      >
        Continue
      </Button>
    </StyledAnnouncement>
  );
}

const StyledAnnouncement = styled(VStack)`
  max-width: 430px;
  text-align: center;
  margin: 48px 32px;
`;

const StyledTitle = styled(TitleCondensed)`
  font-size: 64px;
  line-height: 60px;
`;
