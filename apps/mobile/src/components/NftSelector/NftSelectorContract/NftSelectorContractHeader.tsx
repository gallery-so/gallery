import { View, ViewProps } from 'react-native';

import { BackButton } from '~/components/BackButton';
import { Typography } from '~/components/Typography';

type Props = {
  title: string;
  rightButton?: React.ReactNode;
  style?: ViewProps['style'];
};

export function NftSelectorContractHeader({ title, rightButton, style }: Props) {
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
      {rightButton ? <View>{rightButton}</View> : null}
      {/* {isCreator ? (
        <View>
          <AnimatedRefreshIcon
            isSyncing={isSyncingCreatedTokensForContract}
            onSync={handleSyncTokensForContract}
            eventElementId="NftSelectorSyncCreatedTokensForExistingContractButton"
            eventName="Nft Selector SyncCreatedTokensForExistingContractButton pressed"
          />
        </View>
      ) : null} */}
    </View>
  );
}
