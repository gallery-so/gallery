import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NftDetailScreenQuery } from '~/generated/NftDetailScreenQuery.graphql';
import { RootStackNavigatorParamList } from '~/navigation/types';

import { IconContainer } from '../../components/IconContainer';
import { InteractiveLink } from '../../components/InteractiveLink';
import { Markdown } from '../../components/Markdown';
import { ModalContainer } from '../../components/ModalContainer';
import { Typography } from '../../components/Typography';
import { CloseIcon } from '../../icons/CloseIcon';
import { ShareIcon } from '../../icons/ShareIcon';
import { NftAdditionalDetails } from './NftAdditionalDetails';
import { NftDetail } from './NftDetail';

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
            dbid
            name
            tokenId
            description

            owner {
              username
            }

            ...NftDetailFragment
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
  );

  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);

  const toggleAdditionalDetails = useCallback(() => {
    setShowAdditionalDetails((previous) => !previous);
  }, []);

  const handleShare = useCallback(() => {
    if (
      query.tokenById?.__typename === 'Token' &&
      query.tokenById.owner?.username &&
      query.tokenById.dbid
    ) {
      Share.share({
        url: `https://gallery.so/${query.tokenById.owner.username}/${query.tokenById.dbid}`,
      });
    }
  }, [query.tokenById]);

  return (
    <ModalContainer>
      {query.tokenById?.__typename === 'Token' ? (
        <View className="flex flex-col space-y-8">
          <View className="flex flex-col space-y-3">
            <View className="flex flex-row justify-between">
              <IconContainer icon={<CloseIcon />} onPress={navigation.goBack} />
              <IconContainer icon={<ShareIcon />} onPress={handleShare} />
            </View>

            <NftDetail tokenRef={query.tokenById} />
          </View>

          <Typography
            className="text-2xl"
            font={{ family: 'GTAlpina', weight: 'StandardLight', italic: true }}
          >
            {query.tokenById.name}
          </Typography>

          {query.tokenById.description && (
            <View>
              <Markdown style={markdownStyles}>{query.tokenById.description}</Markdown>
            </View>
          )}

          <View>
            <NftAdditionalDetails showDetails={showAdditionalDetails} tokenRef={query.tokenById} />
          </View>

          <View>
            <InteractiveLink noUnderline={showAdditionalDetails} onPress={toggleAdditionalDetails}>
              {showAdditionalDetails ? 'Hide Details' : 'Show Additional Details'}
            </InteractiveLink>
          </View>
        </View>
      ) : null}
    </ModalContainer>
  );
}
