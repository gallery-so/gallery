import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';
import { contexts } from 'shared/analytics/constants';
import colors from 'shared/theme/colors';
import { useNavigateToCommunityScreen } from 'src/hooks/useNavigateToCommunityScreen';
import { SpinnerIcon } from 'src/icons/SpinnerIcon';

import { Button } from '~/components/Button';
import { BaseM, TitleS } from '~/components/Text';
import { MintProject } from '~/contexts/SanityDataContext';
import {
  HighlightTxStatus,
  MintCampaignPostTransactionMintStatusQuery,
} from '~/generated/MintCampaignPostTransactionMintStatusQuery.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import { NftDetailAsset } from '../../../screens/NftDetailScreen/NftDetailAsset/NftDetailAsset';

export default function MintCampaignPostTransaction({
  claimCode,
  onClose,
  projectData,
}: {
  claimCode: string;
  onClose?: () => void;
  projectData: MintProject;
}) {
  const [state, setState] = useState<HighlightTxStatus>('TX_PENDING');
  // TODO: Fix any - prioritizing merging atm
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [token, setToken] = useState<any>(null);
  const [error, setError] = useState('');
  const relayEnvironment = useRelayEnvironment();

  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async () => {
      if (!isSubscribed) {
        return;
      }

      try {
        const data = await fetchQuery<MintCampaignPostTransactionMintStatusQuery>(
          relayEnvironment,
          graphql`
            query MintCampaignPostTransactionMintStatusQuery($claimCode: DBID!) {
              ... on Query {
                highlightMintClaimStatus(claimId: $claimCode) {
                  ... on HighlightMintClaimStatusPayload {
                    __typename
                    status
                    token {
                      dbid
                      definition {
                        name
                        community {
                          ...useNavigateToCommunityScreenFragment
                        }
                      }
                      ...NftDetailAssetFragment
                    }
                  }
                }
              }
            }
          `,
          { claimCode }
        ).toPromise();

        if (
          !data ||
          data.highlightMintClaimStatus?.__typename !== 'HighlightMintClaimStatusPayload'
        ) {
          throw new Error('There was an error fetching the mint status');
        }

        if (isSubscribed && data.highlightMintClaimStatus) {
          const { status } = data.highlightMintClaimStatus;
          setState(status);
          // If status is TOKEN_SYNCED, stop polling
          if (status === 'TOKEN_SYNCED' && data.highlightMintClaimStatus.token) {
            setToken(data.highlightMintClaimStatus.token);
            isSubscribed = false; // Prevent further state updates
          }
        }
      } catch (e) {
        setError(
          'There was an error while getting your minted token. Please try again later or contact the Gallery team.'
        );
      }
    };

    fetchData();

    // Set up polling
    const intervalId = setInterval(fetchData, 5000);

    // Clean up
    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
    // only run effect once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePostPress = useCallback(() => {
    // handlePress
    if (token?.dbid) {
      navigation.navigate('PostComposer', {
        tokenId: token.dbid,
      });
    }

    if (onClose) {
      onClose();
    }

    // close bottom sheet
  }, [navigation, onClose, token?.dbid]);

  const navigateToCommunity = useNavigateToCommunityScreen();
  const handleSeeCollectionPress = useCallback(() => {
    if (token?.definition?.community) {
      navigateToCommunity(token?.definition?.community);
    }
    if (onClose) {
      onClose();
    }
  }, [navigateToCommunity, onClose, token?.definition?.community]);

  if (state === 'TOKEN_SYNCED' && token) {
    return (
      <View>
        <View className="mb-1">
          <TitleS>Congratulations!</TitleS>
          <TitleS>
            You collected{' '}
            {`${token?.definition?.name ?? projectData.collectionName} by ${
              projectData.artistName
            }`}
          </TitleS>
        </View>
        <BaseM>
          Thank you for using the Gallery mobile app. Share your unique piece with others below!
        </BaseM>
        <View className="my-4">
          <NftDetailAsset tokenRef={token} />
        </View>
        <Button
          text="Post"
          eventElementId="Mint Campaign Post Button"
          eventName="Pressed Mint Campaign Post Button"
          eventContext={contexts['Mint Campaign']}
          className="mb-2"
          onPress={handlePostPress}
        />
        <Button
          text="See collection"
          variant="secondary"
          eventElementId="Mint Campaign See Collection Button"
          eventName="Pressed Mint Campaign See Collection Button"
          eventContext={contexts['Mint Campaign']}
          onPress={handleSeeCollectionPress}
        />
      </View>
    );
  }

  return (
    <View>
      <View className="mb-1">
        <TitleS>{state === 'TX_PENDING' ? 'Minting' : 'Mint Success'}</TitleS>
      </View>
      <BaseM>
        {state === 'TX_PENDING'
          ? 'Your new artwork is being minted onchain. This should take less than a minute.'
          : 'Revealing your artwork. It will be ready to view in a moment!'}
      </BaseM>

      <View className="my-4 flex justify-center items-center bg-faint dark:bg-black-700 w-full aspect-square ">
        <View className="flex items-center m-12">
          <SpinnerIcon
            spin
            size="s"
            colorOverride={{ lightMode: colors.shadow, darkMode: colors.shadow }}
          />
          <LoadingStateMessage funFacts={projectData.funFacts} />
        </View>
      </View>
      {error && <BaseM classNameOverride="text-red">{error}</BaseM>}
    </View>
  );
}

const FADE_DURATION = 250;
const TEXT_DURATION = 8000;

function LoadingStateMessage({ funFacts }: { funFacts: string[] }) {
  const [index, setIndex] = useState(0);

  const fadeInOpacity = useSharedValue(1);

  const fadeIn = useCallback(() => {
    fadeInOpacity.value = withTiming(1, {
      duration: FADE_DURATION,
      easing: Easing.linear,
    });
  }, [fadeInOpacity]);

  const fadeOut = useCallback(() => {
    fadeInOpacity.value = withTiming(0, {
      duration: FADE_DURATION,
      easing: Easing.linear,
    });
  }, [fadeInOpacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeInOpacity.value,
    };
  });

  useEffect(() => {
    const updateDisplayedMessage = async () => {
      fadeOut();
      await new Promise((resolve) => setTimeout(resolve, FADE_DURATION));
      setIndex((index) => (index + 1) % funFacts.length);
      fadeIn();
    };

    const interval = setInterval(updateDisplayedMessage, TEXT_DURATION);

    return () => clearInterval(interval);
  }, [fadeIn, fadeOut, funFacts.length]);
  return (
    <View className="text-center h-32">
      <Animated.View style={[animatedStyle]}>
        <BaseM classNameOverride="text-shadow text-center ">{funFacts[index]}</BaseM>
      </Animated.View>
    </View>
  );
}
