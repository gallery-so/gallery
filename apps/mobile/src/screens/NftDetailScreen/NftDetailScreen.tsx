import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { Pill } from '~/components/Pill';
import { SafeAreaViewWithPadding } from '~/components/SafeAreaViewWithPadding';
import { NftDetailScreenQuery } from '~/generated/NftDetailScreenQuery.graphql';
import { RootStackNavigatorParamList } from '~/navigation/types';

import { IconContainer } from '../../components/IconContainer';
import { InteractiveLink } from '../../components/InteractiveLink';
import { Markdown } from '../../components/Markdown';
import { Typography } from '../../components/Typography';
import { BackIcon } from '../../icons/BackIcon';
import { PoapIcon } from '../../icons/PoapIcon';
import { ShareIcon } from '../../icons/ShareIcon';
import { shareToken } from '../../utils/shareToken';
import { NftAdditionalDetails } from './NftAdditionalDetails';
import { NftDetailAsset } from './NftDetailAsset/NftDetailAsset';

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 14,
  },
});

export function NftDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackNavigatorParamList, 'NftDetail'>>();

  const query = useLazyLoadQuery<NftDetailScreenQuery>(
    graphql`
      query NftDetailScreenQuery($tokenId: DBID!) {
        tokenById(id: $tokenId) {
          ... on Token {
            __typename
            name
            chain
            tokenId
            description

            contract {
              name
              badgeURL
            }

            ...shareTokenFragment
            ...NftDetailAssetFragment
            ...NftAdditionalDetailsFragment
          }
        }
      }
    `,
    { tokenId: route.params.tokenId }
    // Use one of these if you want to test with a specific NFT
    // POAP
    // { tokenId: '2Hu1U34d5UpXWDoVNOkMtguCEpk' }
    // FX Hash
    // { tokenId: '2FmsnRrmb57vIMXuvhzojbVLWCG' }
    // Tezos
    // { tokenId: '2EpXhetYK92diIazWW9iQlC9i6W' }
    // Eth
    // { tokenId: '2EpXhbAjixRMTIveYgoCkpxFAzJ' }
    // Art Gobbler
    // { tokenId: '2GupK6MPJnGukvC36QV3pOYvheS' }
    // SVG
    // { tokenId: '2O1TnqK7sbhbdlAeQwLFkxo8T9i' }
  );

  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);

  const toggleAdditionalDetails = useCallback(() => {
    setShowAdditionalDetails((previous) => !previous);
  }, []);

  const handleShare = useCallback(() => {
    if (query.tokenById?.__typename === 'Token') {
      shareToken(query.tokenById);
    }
  }, [query.tokenById]);

  return (
    <SafeAreaViewWithPadding className="h-full bg-white">
      <ScrollView>
        {query.tokenById?.__typename === 'Token' ? (
          <View className="flex flex-col space-y-8 px-4">
            <View className="flex flex-col space-y-3">
              <View className="flex flex-row justify-between">
                <IconContainer icon={<BackIcon />} onPress={navigation.goBack} />
                <IconContainer icon={<ShareIcon />} onPress={handleShare} />
              </View>

              <NftDetailAsset tokenRef={query.tokenById} />
            </View>

            <View className="flex flex-col space-y-1">
              <Typography
                className="text-2xl"
                font={{ family: 'GTAlpina', weight: 'StandardLight', italic: true }}
              >
                {query.tokenById.name}
              </Typography>

              {query.tokenById.contract?.name ? (
                <TouchableOpacity>
                  <Pill className="flex flex-row space-x-1 self-start">
                    {query.tokenById.chain === 'POAP' && <PoapIcon className="h-6 w-6" />}
                    {query.tokenById.contract?.badgeURL && (
                      <FastImage
                        className="h-6 w-6"
                        source={{ uri: query.tokenById.contract.badgeURL }}
                      />
                    )}
                    <Typography numberOfLines={1} font={{ family: 'ABCDiatype', weight: 'Bold' }}>
                      {query.tokenById.contract.name}
                    </Typography>
                  </Pill>
                </TouchableOpacity>
              ) : null}
            </View>

            {query.tokenById.description && (
              <View>
                <Markdown style={markdownStyles}>{query.tokenById.description}</Markdown>
              </View>
            )}

            <View className="flex-1">
              <NftAdditionalDetails
                showDetails={showAdditionalDetails}
                tokenRef={query.tokenById}
              />
            </View>

            <View>
              <InteractiveLink
                noUnderline={showAdditionalDetails}
                onPress={toggleAdditionalDetails}
              >
                {showAdditionalDetails ? 'Hide Details' : 'Show Additional Details'}
              </InteractiveLink>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaViewWithPadding>
  );
}
