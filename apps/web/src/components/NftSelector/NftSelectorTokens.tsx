import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { NftSelectorTokensFragment$key } from '~/generated/NftSelectorTokensFragment.graphql';
import { NftSelectorTokensQueryFragment$key } from '~/generated/NftSelectorTokensQueryFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';
import useExperience from '~/shared/hooks/useExperience';
import { Chain } from '~/shared/utils/chains';

import CreatorSupportAnnouncement from '../Announcement/CreatorSupportAnnouncement';
import { VStack } from '../core/Spacer/Stack';
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
  queryRef: NftSelectorTokensQueryFragment$key;
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
  queryRef,
}: Props) {
  const tokens = useFragment(
    graphql`
      fragment NftSelectorTokensFragment on Token @relay(plural: true) {
        ...NftSelectorViewFragment
      }
    `,
    tokenRefs
  );

  const query = useFragment(
    graphql`
      fragment NftSelectorTokensQueryFragment on Query {
        ...useExperienceFragment
      }
    `,
    queryRef
  );

  const [creatorBetaAnnouncementSeen, setCreatorBetaAnnouncementSeen] = useExperience({
    type: 'CreatorBetaMicroAnnouncementModal',
    queryRef: query,
  });

  const handleContinueCreatorBetaClick = useCallback(() => {
    setCreatorBetaAnnouncementSeen();
  }, [setCreatorBetaAnnouncementSeen]);

  const showCreatorBetaAnnouncement = useMemo(() => {
    return selectedFilter === 'Created' && !creatorBetaAnnouncementSeen;
  }, [creatorBetaAnnouncementSeen, selectedFilter]);

  if (showCreatorBetaAnnouncement) {
    return (
      <StyledWrapper justify="center">
        <CreatorSupportAnnouncement
          handleContinueCreatorBetaClick={handleContinueCreatorBetaClick}
          eventFlow={eventFlow}
          eventContext={contexts.Posts}
        />
      </StyledWrapper>
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

const StyledWrapper = styled(VStack)`
  height: 500px;
  margin: auto;
`;
