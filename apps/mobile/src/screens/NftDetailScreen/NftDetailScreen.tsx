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
      query NftDetailScreenQuery($tokenId: DBID!, $collectionId: DBID!) {
        collectionTokenById(tokenId: $tokenId, collectionId: $collectionId) {
          ... on CollectionToken {
            __typename

            token @required(action: THROW) {
              __typename
              name
              chain
              tokenId
              description

              contract {
                name
                badgeURL
              }

              ...NftAdditionalDetailsFragment
            }

            ...shareTokenFragment
            ...NftDetailAssetFragment
          }
        }
      }
    `,
    { tokenId: route.params.tokenId, collectionId: route.params.collectionId }
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

  const collectionToken = query.collectionTokenById;

  if (collectionToken?.__typename !== 'CollectionToken') {
    throw new Error('Invalid token');
  }

  const token = collectionToken.token;

  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);

  const toggleAdditionalDetails = useCallback(() => {
    setShowAdditionalDetails((previous) => !previous);
  }, []);

  const handleShare = useCallback(() => {
    shareToken(collectionToken);
  }, [collectionToken]);

  return (
    <SafeAreaViewWithPadding className="h-full bg-white dark:bg-black">
      <ScrollView>
        <View className="flex flex-col space-y-8 px-4">
          <View className="flex flex-col space-y-3">
            <View className="flex flex-row justify-between">
              <IconContainer icon={<BackIcon />} onPress={navigation.goBack} />
              <IconContainer icon={<ShareIcon />} onPress={handleShare} />
            </View>

            <NftDetailAsset collectionTokenRef={collectionToken} />
          </View>

          <View className="flex flex-col space-y-4">
            <Typography
              className="text-2xl"
              font={{ family: 'GTAlpina', weight: 'StandardLight', italic: true }}
            >
              {token.name}
            </Typography>

            {token.contract?.name ? (
              <TouchableOpacity>
                <Pill className="flex flex-row space-x-1 self-start">
                  {token.chain === 'POAP' && <PoapIcon className="h-6 w-6" />}
                  {token.contract?.badgeURL && (
                    <FastImage className="h-6 w-6" source={{ uri: token.contract.badgeURL }} />
                  )}
                  <Typography numberOfLines={1} font={{ family: 'ABCDiatype', weight: 'Bold' }}>
                    {token.contract.name}
                  </Typography>
                </Pill>
              </TouchableOpacity>
            ) : null}
          </View>

          {token.description && (
            <View>
              <Markdown style={markdownStyles}>{token.description}</Markdown>
            </View>
          )}

          <View className="flex-1">
            <NftAdditionalDetails showDetails={showAdditionalDetails} tokenRef={token} />
          </View>

          <View>
            <InteractiveLink onPress={toggleAdditionalDetails}>
              {showAdditionalDetails ? 'Hide Details' : 'Show Additional Details'}
            </InteractiveLink>
          </View>
        </View>
      </ScrollView>
    </SafeAreaViewWithPadding>
  );
}
