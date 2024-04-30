import { useCallback } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { AnimatedRefreshIcon } from '~/components/AnimatedRefreshIcon';
import { BackButton } from '~/components/BackButton';
import { Typography } from '~/components/Typography';
import { useSyncTokensActions } from '~/contexts/SyncTokensContext';

type Props = {
  title: string;
  rightButton?: React.ReactNode;
  style?: ViewProps['style'];
  contractId?: string;
  isCreator?: boolean;
};

export function NftSelectorContractHeader({
  title,
  rightButton,
  style,
  contractId,
  isCreator,
}: Props) {
  const { isSyncingCreatedTokensForContract, syncCreatedTokensForExistingContract } =
    useSyncTokensActions();

  const animateStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(rightButton ? 1 : 0),
    };
  });

  const handleSyncTokensForContract = useCallback(async () => {
    if (!contractId) return;
    syncCreatedTokensForExistingContract(contractId);
  }, [syncCreatedTokensForExistingContract, contractId]);

  return (
    <View className="px-4 relative flex flex-row justify-between items-center" style={style}>
      <View>
        <BackButton />
      </View>
      <View
        className="absolute inset-0 flex flex-row justify-center items-center"
        pointerEvents="none"
      >
        <Typography
          numberOfLines={1}
          className="text-sm"
          style={{ maxWidth: '65%' }}
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          {title}
        </Typography>
      </View>
      <Animated.View style={animateStyle}>{rightButton && rightButton}</Animated.View>
      {isCreator && contractId ? (
        <View>
          <AnimatedRefreshIcon
            isSyncing={isSyncingCreatedTokensForContract}
            onSync={handleSyncTokensForContract}
            eventElementId="NftSelectorSyncCreatedTokensForExistingContractButton"
            eventName="Nft Selector SyncCreatedTokensForExistingContractButton pressed"
          />
        </View>
      ) : null}
    </View>
  );
}
