import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { TitleXS } from '~/components/core/Text/Text';
import { GalleryPill } from '~/components/GalleryPill';
import { contexts } from '~/shared/analytics/constants';

type Props = {
  url: string;
  icon: React.ReactNode;
  username: string;
  className?: string;
  platform: 'twitter' | 'lens' | 'farcaster';
};

export default function UserSocialPill({ url, icon, username, className, platform }: Props) {
  return (
    <StyledUserSocialPill
      eventElementId="External Social Pill"
      eventName="Visit External Social Link"
      eventContext={contexts['External Social']}
      properties={{ platform }}
      href={url}
      className={className}
    >
      <StyledPillContent gap={5} align="center">
        <StyledIconContainer>{icon}</StyledIconContainer>
        <StyledHandle>{username}</StyledHandle>
      </StyledPillContent>
    </StyledUserSocialPill>
  );
}

export const StyledUserSocialPill = styled(GalleryPill)`
  flex-basis: 0;
`;

const StyledPillContent = styled(HStack)`
  width: 100%;
`;

const StyledIconContainer = styled.div`
  width: 16px;
  display: flex;
  justify-content: center;
`;

const StyledHandle = styled(TitleXS)`
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 700;
  text-transform: initial;
  white-space: nowrap;
`;
