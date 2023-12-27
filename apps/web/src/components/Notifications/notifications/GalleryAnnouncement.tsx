import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { GalleryAnnouncementFragment$key } from '~/generated/GalleryAnnouncementFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';

type Props = {
  notificationRef: GalleryAnnouncementFragment$key;
  onClose: () => void;
};

export function GalleryAnnouncement({ notificationRef, onClose }: Props) {
  const notification = useFragment(
    graphql`
      fragment GalleryAnnouncementFragment on GalleryAnnouncementNotification {
        __typename
        title
        description
        ctaText
        ctaLink
        imageUrl
      }
    `,
    notificationRef
  );

  const { title, description, ctaText, ctaLink, imageUrl } = notification;

  const handleClick = useCallback(() => {
    if (!ctaLink) return;
    window.open(ctaLink, '_blank');
    onClose();
  }, [ctaLink, onClose]);

  return (
    <StyledNotificationContent align="center" justify="space-between" gap={8}>
      <HStack align="center" gap={8}>
        <VStack>{imageUrl ? <StyledImage src={imageUrl} /> : <StyledDefaultImage />}</VStack>

        <VStack>
          <StyledTextWrapper align="center" as="span" wrap="wrap">
            <BaseM>
              <strong>{title} </strong>
            </BaseM>
            <BaseM as="span">{description}</BaseM>
          </StyledTextWrapper>
        </VStack>
      </HStack>

      {ctaText && (
        <StyledButton
          eventElementId="Cta link from gallery announcement"
          eventName="Click cta link from gallery announcement"
          eventContext={contexts.Notifications}
          variant="primary"
          onClick={handleClick}
        >
          {ctaText}
        </StyledButton>
      )}
    </StyledNotificationContent>
  );
}

const StyledNotificationContent = styled(HStack)`
  width: 100%;
`;

const StyledTextWrapper = styled(HStack)`
  display: inline;
`;

const StyledButton = styled(Button)`
  padding: 2px 8px;
  width: 92px;
  height: 24px;
  font-weight: 600;
  text-transform: capitalize;
  border-radius: 2px;
`;

const StyledImage = styled.img`
  height: 64px;
  width: 64px;
`;

const StyledDefaultImage = styled.div`
  height: 64px;
  width: 64px;
  background-color: ${colors.metal};
`;
