import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { RefreshIcon } from 'src/icons/RefreshIcon';
import { useSyncTokenstActions } from '~/contexts/SyncTokensContext';

import { BackButton } from '~/components/BackButton';
import { IconContainer } from '~/components/IconContainer';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';
import { useToastActions } from '~/contexts/ToastContext';
import { NftSelectorContractScreenQuery } from '~/generated/NftSelectorContractScreenQuery.graphql';
import { MainTabStackNavigatorParamList, MainTabStackNavigatorProp } from '~/navigation/types';
import { NftSelectorPickerSingularAsset } from '~/screens/NftSelectorScreen/NftSelectorPickerSingularAsset';
import { removeNullValues } from '~/shared/relay/removeNullValues';

export function NftSelectorContractScreen() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'NftSelectorContractScreen'>>();
  const query = useLazyLoadQuery<NftSelectorContractScreenQuery>(
    graphql`
      query NftSelectorContractScreenQuery {
        viewer {
          ... on Viewer {
            user {
              tokens {
                dbid
                contract {
                  dbid
                  name
                  contractAddress {
                    address
                  }
                }

                ...NftSelectorPickerSingularAssetFragment
              }
            }
          }
        }
      }
    `,
    {}
  );

  const { top } = useSafeAreaPadding();
  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const isFullscreen = route.params.fullScreen;
  const isCreator = route.params.filter === 'Created';

  const handleSelectNft = useCallback(() => {
    navigation.pop(2);
  }, [navigation]);

  const tokens = useMemo(() => {
    return removeNullValues(
      query.viewer?.user?.tokens?.filter((token) => {
        return token?.contract?.contractAddress?.address === route.params.contractAddress;
      })
    );
  }, [query.viewer?.user?.tokens, route.params.contractAddress]);

  const contractName = tokens[0]?.contract?.name;
  const contractId = tokens[0]?.contract?.dbid;
  console.log("contractId", contractId);
  console.log("contractName", contractName);

  const rows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < tokens.length; i += 3) {
      rows.push(tokens.slice(i, i + 3));
    }
    return rows;
  }, [tokens]);

  const renderItem = useCallback<ListRenderItem<typeof tokens>>(
    ({ item: row }) => {
      return (
        <View className="flex space-x-4 flex-row mb-4 px-4">
          {row.map((token) => {
            return (
              <NftSelectorPickerSingularAsset
                key={token.dbid}
                onSelect={handleSelectNft}
                tokenRef={token}
              />
            );
          })}

          {Array.from({ length: 3 - row.length }).map((_, index) => {
            return <View key={index} className="flex-1 aspect-square" />;
          })}
        </View>
      );
    },
    [handleSelectNft]
  );

  return (
    <View
      className="flex-1 bg-white dark:bg-black-900"
      style={{
        paddingTop: isFullscreen ? top : 16,
      }}
    >
      <View className="flex flex-col space-y-8 flex-1">
        <View className="px-4 relative flex flex-row justify-between items-center">
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
              {contractName}
            </Typography>
          </View>
          {isCreator ? (
            <View>
              <AnimatedRefreshContractIcon contractId={contractId ?? ''} />
            </View>
          ) : null}
        </View>
        <View className="flex-1 w-full">
          <FlashList renderItem={renderItem} data={rows} estimatedItemSize={100} />
        </View>
      </View>
    </View>
  );
}

type AnimatedRefreshContractIconProps = {
  contractId: string;
};

function AnimatedRefreshContractIcon({ contractId }: AnimatedRefreshContractIconProps) {
  const { isSyncing, syncCreatedTokensForExistingContract } = useSyncTokenstActions();

  const handleSyncCreatedTokensForExistingContracts = useCallback(async () => {
    if (isSyncing) return;
    syncCreatedTokensForExistingContract(contractId);
  }, [isSyncing, contractId, syncCreatedTokensForExistingContract]);

  const spinValue = useRef(new Animated.Value(0)).current;

  const spin = useCallback(() => {
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(({ finished }) => {
      // Only repeat the animation if it completed (wasn't interrupted) and isSyncing is still true
      if (finished && isSyncing) {
        spin();
      }
    });
  }, [isSyncing, spinValue]);

  const spinAnimation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    if (isSyncing) {
      spin();
    } else {
      spinValue.stopAnimation();
    }
  }, [isSyncing, spin, spinValue]);

  return (
    <IconContainer
      size="sm"
      onPress={handleSyncCreatedTokensForExistingContracts}
      icon={
        <Animated.View style={{ transform: [{ rotate: spinAnimation }] }}>
          <RefreshIcon />
        </Animated.View>
      }
      eventElementId="NftSelectorSelectorRefreshContractButton"
      eventName="NftSelectoreSelectorRefreshContractButton pressed"
    />
  );
}
