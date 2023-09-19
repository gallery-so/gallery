import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import { UpsellBannerQuery$key } from '~/generated/UpsellBannerQuery.graphql';
import useAddWalletModal from '~/hooks/useAddWalletModal';
import CloseIcon from '~/icons/CloseIcon';
import colors from '~/shared/theme/colors';
import useExperience from '~/utils/graphql/experiences/useExperience';

import breakpoints from '../core/breakpoints';
import { Button } from '../core/Button/Button';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';

type Props = {
  queryRef: UpsellBannerQuery$key;
};

const USER_EXPERIENCE_KEY = 'UpsellBanner';

export function UpsellBanner({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment UpsellBannerQuery on Query {
        ...useExperienceFragment
      }
    `,
    queryRef
  );

  const showAddWalletModal = useAddWalletModal();
  const [hasExperienced, updateUserExperience] = useExperience({
    type: USER_EXPERIENCE_KEY,
    queryRef: query,
  });

  const handleConnectWallet = useCallback(() => {
    showAddWalletModal({
      onConnectWalletSuccess: () => {
        updateUserExperience();
      },
    });
  }, [showAddWalletModal, updateUserExperience]);

  const handleClose = useCallback(() => {
    updateUserExperience();
  }, [updateUserExperience]);

  if (hasExperienced) {
    return null;
  }

  return (
    <StyledWrapper align="center" justify="space-between">
      <StyledTextWrapper>
        <BaseM>
          <strong>Gallery is better with a wallet</strong>
        </BaseM>
        <BaseM>Add your wallet to start posting and curating</BaseM>
      </StyledTextWrapper>
      <StyledButtonWrapper>
        <StyledButton onClick={handleConnectWallet}>Connect</StyledButton>

        <IconContainer variant="blue" size="sm" icon={<StyledCloseIcon />} onClick={handleClose} />
      </StyledButtonWrapper>
    </StyledWrapper>
  );
}

const StyledWrapper = styled(HStack)`
  background-color: ${colors.activeBlue};
  padding: 8px 16px;

  ${BaseM} {
    color: ${colors.white};
  }
`;

const StyledTextWrapper = styled(VStack)`
  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
    gap: 8px;
  }
`;

const StyledButtonWrapper = styled(HStack).attrs({
  align: 'center',
})`
  gap: 8px;

  @media only screen and ${breakpoints.tablet} {
    gap: 24px;
  }
`;

const StyledCloseIcon = styled(CloseIcon)`
  color: ${colors.white};
`;

const StyledButton = styled(Button)`
  background-color: ${colors.offWhite};
  color: ${colors.activeBlue};
  font-weight: 500;
`;
