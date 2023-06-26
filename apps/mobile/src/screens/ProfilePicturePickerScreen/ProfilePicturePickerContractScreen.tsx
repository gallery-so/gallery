import { RouteProp, useRoute } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { BackButton } from '~/components/BackButton';
import { NftPreviewAsset } from '~/components/NftPreview/NftPreviewAsset';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Select } from '~/components/Select';
import { Typography } from '~/components/Typography';
import { ProfilePicturePickerContractScreenQuery } from '~/generated/ProfilePicturePickerContractScreenQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';
import { removeNullValues } from '~/shared/relay/removeNullValues';

export function ProfilePicturePickerContractScreen() {
  const route =
    useRoute<RouteProp<MainTabStackNavigatorParamList, 'ProfilePicturePickerContract'>>();
  const query = useLazyLoadQuery<ProfilePicturePickerContractScreenQuery>(
    graphql`
      query ProfilePicturePickerContractScreenQuery {
        viewer {
          ... on Viewer {
            user {
              tokens {
                dbid
                contract {
                  name
                  contractAddress {
                    address
                  }
                }

                ...getVideoOrImageUrlForNftPreviewFragment
              }
            }
          }
        }
      }
    `,
    {}
  );

  const { top } = useSafeAreaPadding();

  const [sort, setSort] = useState<'Collected' | 'Created'>('Collected');

  const tokens = useMemo(() => {
    return removeNullValues(
      query.viewer?.user?.tokens
        ?.filter((token) => {
          return token?.contract?.contractAddress?.address === route.params.contractAddress;
        })
        .map((token) => {
          if (!token) {
            return null;
          }

          const url = getVideoOrImageUrlForNftPreview({ tokenRef: token })?.urls.large;

          if (!url) {
            return null;
          }

          return { tokenUrl: url, dbid: token.dbid, contractName: token.contract?.name };
        })
    );
  }, [query.viewer?.user?.tokens, route.params.contractAddress]);

  const contractName = tokens[0]?.contractName;

  const rows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < tokens.length; i += 3) {
      rows.push(tokens.slice(i, i + 3));
    }
    return rows;
  }, [tokens]);

  return (
    <View className="flex-1 bg-white dark:bg-black-900" style={{ paddingTop: top }}>
      <View className="flex flex-col space-y-8">
        <View className="px-4 relative">
          <BackButton />

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
        </View>

        <View className="px-4">
          <Select
            eventElementId="ProfilePictureSort"
            className="w-32"
            options={[
              { id: 'Collected', label: 'Collected' },
              { id: 'Created', label: 'Created' },
            ]}
            onChange={setSort}
            selectedId={sort}
          />
        </View>

        <View className="flex flex-col space-y-4 px-4">
          {rows.map((row) => {
            return (
              <View className="flex flex-row space-x-4">
                {row.map((token) => {
                  return (
                    <View key={token.dbid} className="flex-1 aspect-square bg-orange-300">
                      <NftPreviewAsset tokenUrl={token.tokenUrl} resizeMode={ResizeMode.COVER} />
                    </View>
                  );
                })}

                {Array.from({ length: 3 - row.length }).map((_, index) => {
                  return <View key={index} className="flex-1 aspect-square" />;
                })}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
