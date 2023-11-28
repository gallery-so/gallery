import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { UpsellBannerQuery$key } from '~/generated/UpsellBannerQuery.graphql';
import useAddWalletModal from '~/hooks/useAddWalletModal';
import useExperience from '~/shared/hooks/useExperience';

import { GlobalBanner } from '../core/GlobalBanner/GlobalBanner';

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
    <GlobalBanner
      title="Gallery is better with a wallet"
      description="Add your wallet to start posting and curating"
      onClose={handleClose}
      onClick={handleConnectWallet}
      ctaText="Connect"
      experienceFlag="UpsellBanner"
      bannerVariant="blue"
    />
  );
}
