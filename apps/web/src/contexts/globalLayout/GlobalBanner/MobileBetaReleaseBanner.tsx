import Image from 'next/image';
import { useRouter } from 'next/router';
import appIcon from 'public/gallery-app-ios-icon.png';
import { useCallback } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleXSBold } from '~/components/core/Text/Text';
import { UserExperienceType } from '~/generated/enums';
import colors from '~/shared/theme/colors';

type Props = {
  handleCTAClick: () => void;
  experienceFlag: UserExperienceType;
};

export default function MobileBetaReleaseBanner({ handleCTAClick, experienceFlag }: Props) {
  const { push } = useRouter();

  const handleClick = useCallback(() => {
    push('/mobile');

    handleCTAClick();
  }, [handleCTAClick, push]);

  return (
    <StyledContainer align="center">
      <StyledContent align="center" justify="space-between">
        <StyledLeftContent gap={6} align="center">
          <StyledImage src={appIcon} alt="iOS app icon" />
          <VStack justify="space-between">
            <StyledHeader>Gallery</StyledHeader>
            <StyledDescription>Mobile app beta now available</StyledDescription>
          </VStack>
        </StyledLeftContent>
        <StyledDownloadButton
          eventElementId="Global Banner CTA Button"
          eventName="Global Banner CTA Button Clicked"
          properties={{ variant: 'iOS Mobile Beta Upsell', experienceFlag }}
          onClick={handleClick}
        >
          <StyledDownloadText>DOWNLOAD</StyledDownloadText>
        </StyledDownloadButton>
      </StyledContent>
    </StyledContainer>
  );
}

const StyledContainer = styled(HStack)`
  position: absolute;
  width: 100%;
  z-index: 4;
  height: 56px;
  border-bottom: 1px solid ${colors.faint};
  background: rgba(254, 254, 254, 0.95);
  backdrop-filter: blur(48px);
  padding: 0 16px;
`;

const StyledContent = styled(HStack)`
  height: 32px;
  width: 100%;
`;

const StyledHeader = styled.div`
  font-size: 14px;
  font-weight: 700;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont;
`;

const StyledDescription = styled.div`
  font-size: 12px;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont;
  color: ${colors.shadow};
`;

const StyledLeftContent = styled(HStack)``;

const StyledImage = styled(Image)`
  width: 32px;
  height: 32px;
`;

const StyledDownloadButton = styled(Button)`
  background: #3478f6;
  border-radius: 48px;
  width: 107px;
  height: 24px;
  border: none;
`;

const StyledDownloadText = styled(TitleXSBold)`
  color: ${colors.white};
`;
