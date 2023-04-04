import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback } from 'react';
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
            description
            contract {
              name
            }
            owner {
              username
            }
            ...NftDetailFragment
          }
        }
      }
    `,
    { tokenId: route.params.tokenId }
  );

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
            <Markdown style={markdownStyles}>{query.tokenById.description}</Markdown>
          )}

          <View className="flex flex-col space-y-4">
            {query.tokenById.owner?.username && (
              <View className="flex flex-col">
                <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Medium' }}>
                  OWNED BY
                </Typography>

                {/* TODO(Terence) When the user profile screen is ready, setup the onPress here */}
                <InteractiveLink>{query.tokenById.owner.username}</InteractiveLink>
              </View>
            )}

            {query.tokenById.contract?.name && (
              <View className="flex flex-col">
                <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Medium' }}>
                  OWNED BY
                </Typography>

                {/* TODO(Terence) When the contract screen is ready, setup the onPress here */}
                <InteractiveLink>{query.tokenById.contract.name}</InteractiveLink>
              </View>
            )}
          </View>
        </View>
      ) : null}
    </ModalContainer>
  );
}
