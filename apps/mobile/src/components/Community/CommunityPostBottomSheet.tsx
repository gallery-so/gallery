import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { RefreshIcon } from 'src/icons/RefreshIcon';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { useSyncTokensActions } from '~/contexts/SyncTokensContext';
import { useToastActions } from '~/contexts/ToastContext';
import { CommunityPostBottomSheetFragment$key } from '~/generated/CommunityPostBottomSheetFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { extractRelevantMetadataFromCommunity } from '~/shared/utils/extractRelevantMetadataFromCommunity';

import { Button } from '../Button';
import { Typography } from '../Typography';

type Props = {
  communityRef: CommunityPostBottomSheetFragment$key;
  onRefresh: () => void;
};

export default function CommunityPostBottomSheet({ communityRef, onRefresh }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityPostBottomSheetFragment on Community {
        name
        ...extractRelevantMetadataFromCommunityFragment
      }
    `,
    communityRef
  );

  const { isSyncing, syncTokens } = useSyncTokensActions();
  const { pushToast } = useToastActions();

  const { hideBottomSheetModal } = useBottomSheetModalActions();

  const closeBottomSheet = useCallback(() => {
    hideBottomSheetModal();
  }, [hideBottomSheetModal]);

  const { chain } = extractRelevantMetadataFromCommunity(community);

  const handleSync = useCallback(async () => {
    if (!chain || chain === 'All Networks') return;

    await syncTokens(chain);

    closeBottomSheet();

    onRefresh();
    pushToast({
      message: 'Successfully refreshed your collection',
    });
  }, [closeBottomSheet, chain, onRefresh, pushToast, syncTokens]);

  return (
    <View className="flex flex-col space-y-6">
      <View className="flex flex-col space-y-4">
        <Typography
          className="text-lg text-black-900 dark:text-offWhite"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          Ownership required
        </Typography>
        <Text>
          <Typography
            className="text-md text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            Only {community.name} owners can post about {community.name}. If you own this item but
            it's not displaying try
          </Typography>{' '}
          <Typography
            className="text-md text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            refreshing your collection.
          </Typography>
        </Text>
        <Button
          text="Ok"
          onPress={closeBottomSheet}
          eventElementId={null}
          eventName={null}
          eventContext={null}
        />
        <Button
          text="Refresh collection"
          variant="secondary"
          loading={isSyncing}
          onPress={handleSync}
          headerElement={<RefreshIcon />}
          eventElementId="Refresh Tokens From Community Screen Button"
          eventName="Refresh Tokens From Community Screen"
          eventContext={contexts.Posts}
        />
      </View>
    </View>
  );
}
