import { useEffect } from 'react';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { useSanityAnnouncementContext } from '~/contexts/SanityAnnouncementProvider';
import CloseIcon from '~/icons/CloseIcon';
import { APP_STORE_URL } from '~/scenes/LandingPage/LandingPage';

import GalleryLink from '../core/GalleryLink/GalleryLink';
import IconContainer from '../core/IconContainer';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';

type Announcement = {
  internal_id: string;
  active: boolean;
  title: string;
  description: string;
  imageUrl: string;
  platform: string;
};

// Renders an announcement notification from Sanity
export default function AnnouncementNotification({ announcement }: { announcement: Announcement }) {
  const { dismissAnnouncement, markAnnouncementAsSeen } = useSanityAnnouncementContext();

  useEffect(() => {
    markAnnouncementAsSeen();
    // Only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledAnnouncementNotification align="center" gap={8}>
      <GalleryLink href={APP_STORE_URL} target="_blank" rel="noreferrer">
        <HStack align="center" gap={8}>
          <StyledImage src={announcement.imageUrl} alt="Announcement preview thumbnail" />
          <VStack>
            <BaseM color={colors.activeBlue}>
              <strong>{announcement.title}</strong>
            </BaseM>
            <BaseM color={colors.activeBlue}>{announcement.description}</BaseM>
          </VStack>
        </HStack>
      </GalleryLink>
      <IconContainer
        size="sm"
        onClick={dismissAnnouncement}
        variant="default"
        icon={
          <StyledIconWrapper>
            <CloseIcon />
          </StyledIconWrapper>
        }
      />
    </StyledAnnouncementNotification>
  );
}

const StyledAnnouncementNotification = styled(HStack)`
  margin: 4px 12px;
  border: 1px solid ${colors.activeBlue};
  padding: 8px 12px;
`;

const StyledImage = styled.img`
  height: 56px;
  width: 56px;
`;

const StyledIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.activeBlue};
`;
