import AppleLogo from 'public/icons/apple_logo.svg';
import { useCallback } from 'react';
import { contexts } from 'shared/analytics/constants';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleCondensed } from '~/components/core/Text/Text';
import { useBottomSheetActions } from '~/contexts/bottomsheet/BottomSheetContext';

import { APP_STORE_URL } from './LandingPage';

type Props = {
  onContinueInBrowserClick: () => void;
};

export function MobileAppsUpsellBottomSheet({ onContinueInBrowserClick }: Props) {
  const { hideBottomSheet } = useBottomSheetActions();

  const handleDownloadAppClick = useCallback(() => {
    window.open(APP_STORE_URL, '_blank');
  }, []);

  const handleContinueInBrowserClick = useCallback(() => {
    hideBottomSheet();
    onContinueInBrowserClick();
  }, [hideBottomSheet, onContinueInBrowserClick]);

  return (
    <StyledWrapper gap={32}>
      <VStack gap={24}>
        <StyledTitle>Introducing the Gallery mobile app</StyledTitle>
        <BaseM>Theres no better experience than the official Gallery app on mobile.</BaseM>
      </VStack>
      <VStack gap={16}>
        <Button
          eventElementId="Mobile Landing Page Bottom Sheet Download App Button"
          eventName="Mobile Landing Page Bottom Sheet Download App Button Click"
          eventContext={contexts['Mobile App Upsell']}
          onClick={handleDownloadAppClick}
        >
          <HStack gap={8} align="center">
            <AppleLogo width={27} height={27} />
            Download APP
          </HStack>
        </Button>
        <BaseM onClick={handleContinueInBrowserClick}>Continue in browser</BaseM>
      </VStack>
    </StyledWrapper>
  );
}

const StyledWrapper = styled(VStack)`
  text-align: center;
  padding: 16px 0;
`;

const StyledTitle = styled(TitleCondensed)`
  font-size: 48px;
  line-height: 1;
`;
