import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { CREATOR_BETA_ANNOUNCEMENT_SEEN } from '~/constants/storageKeys';
import { NftSelectorTokensFragment$key } from '~/generated/NftSelectorTokensFragment.graphql';
import usePersistedState from '~/hooks/usePersistedState';
import { contexts } from '~/shared/analytics/constants';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';
import { Chain } from '~/shared/utils/chains';

import { Button } from '../core/Button/Button';
import GalleryLink from '../core/GalleryLink/GalleryLink';
import { VStack } from '../core/Spacer/Stack';
import { BaseM, TitleCondensed } from '../core/Text/Text';
import { NftSelectorContractType } from './NftSelector';
import { NftSelectorLoadingView } from './NftSelectorLoadingView';
import { NftSelectorView } from './NftSelectorView';
type Props = {
  selectedFilter: string;
  isLocked: boolean;
  tokenRefs: NftSelectorTokensFragment$key;
  selectedContractAddress: string | null;
  onSelectContract: (contract: NftSelectorContractType) => void;
  onSelectToken: (tokenId: string) => void;
  eventFlow: GalleryElementTrackingProps['eventFlow'];
  selectedNetworkView: Chain;
  hasSearchKeyword: boolean;
  handleRefresh: () => void;
};

export default function NftSelectorTokens({
  selectedFilter,
  isLocked,
  selectedContractAddress,
  onSelectContract,
  onSelectToken,
  tokenRefs,
  selectedNetworkView,
  hasSearchKeyword,
  handleRefresh,
  eventFlow,
}: Props) {
  const tokens = useFragment(
    graphql`
      fragment NftSelectorTokensFragment on Token @relay(plural: true) {
        ...NftSelectorViewFragment
      }
    `,
    tokenRefs
  );

  const [creatorBetaAnnouncementSeen, setCreatorBetaAnnouncementSeen] = usePersistedState(
    CREATOR_BETA_ANNOUNCEMENT_SEEN,
    'false'
  );

  const handleContinueCreatorBetaClick = useCallback(() => {
    setCreatorBetaAnnouncementSeen('true');
  }, [setCreatorBetaAnnouncementSeen]);

  const showCreatorBetaAnnouncement = useMemo(() => {
    console.log(selectedFilter, creatorBetaAnnouncementSeen);
    return selectedFilter === 'Created' && creatorBetaAnnouncementSeen === 'false';
  }, [creatorBetaAnnouncementSeen, selectedFilter]);

  if (showCreatorBetaAnnouncement) {
    return (
      <StyledAnnouncement align="center" justify="center" gap={24}>
        <StyledTitle>Gallery for Creators is now in beta</StyledTitle>
        <BaseM>
          Welcome to our new creator support feature, currently in beta. Share and display works
          you’ve created on Gallery. Learn more about how it works{' '}
          <GalleryLink href={'https://gallery.so'}>in our FAQ here</GalleryLink>.
        </BaseM>
        <Button
          eventElementId="Creator Beta Announcement Continue Button"
          eventName="Clicked Continue on Creator Beta Announcement"
          eventContext={contexts.Posts}
          eventFlow={eventFlow}
          variant="primary"
          onClick={handleContinueCreatorBetaClick}
        >
          Continue
        </Button>
      </StyledAnnouncement>
    );
  }

  if (isLocked) {
    return <NftSelectorLoadingView />;
  }

  return (
    <NftSelectorView
      tokenRefs={tokens}
      selectedContractAddress={selectedContractAddress}
      onSelectContract={onSelectContract}
      onSelectToken={onSelectToken}
      eventFlow={eventFlow}
      selectedNetworkView={selectedNetworkView}
      hasSearchKeyword={hasSearchKeyword}
      handleRefresh={handleRefresh}
    />
  );
}

const StyledAnnouncement = styled(VStack)`
  max-width: 430px;
  margin: auto;
  height: 500px;
  text-align: center;
`;

const StyledTitle = styled(TitleCondensed)`
  font-size: 64px;
  line-height: 60px;
`;
