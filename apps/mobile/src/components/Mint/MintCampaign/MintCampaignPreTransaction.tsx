import { Suspense, useCallback, useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { contexts } from 'shared/analytics/constants';
import { useHighlightClaimMint } from 'src/hooks/useHighlightClaimMint';

import { Button } from '~/components/Button';
import { BaseM, BaseS, TitleLItalic, TitleS } from '~/components/Text';
import { MintCampaignPreTransactionQuery } from '~/generated/MintCampaignPreTransactionQuery.graphql';

export const MCHX_MINT_CAMPAIGN_END_DATE = '2024-03-30T00:00:00-05:00';
const MCHX_COLLECTION_ID = '65ec1cefb5813a0adf4dff4e';

export default function MintCampaignPreTransaction({
  setClaimCode,
}: {
  setClaimCode: (claimCode: string) => void;
}) {
  const calculateTimeLeftText = useCallback(() => {
    const endDate = new Date(MCHX_MINT_CAMPAIGN_END_DATE).getTime();
    const now = new Date().getTime();
    const difference = endDate - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      return `Ending ${days}d ${hours}h ${minutes}m`;
    }

    return 'Campaign ended';
  }, []);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeftText());
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeftText());
    }, 60000);

    return () => clearTimeout(timer);
  });

  const { claimMint, isClamingMint } = useHighlightClaimMint();

  const handlePress = useCallback(
    async (recipientWalletId: string) => {
      if (!recipientWalletId) {
        return;
      }

      try {
        const claimCode = await claimMint({
          collectionId: MCHX_COLLECTION_ID,
          recipientWalletId,
        });

        if (claimCode) {
          setClaimCode(claimCode);
          // TODO: save claim code in local storage to check status later
        }
      } catch (e) {
        console.error(e);
        if (e === 'ErrHighlightMintUnavailable') {
          setError('Minting is currently unavailable.');
          return;
        }
        setError('Something went wrong while minting. Please try again.');
      }
    },
    [claimMint, setClaimCode]
  );

  return (
    <View>
      <TitleS>Exclusive free mint</TitleS>
      <BaseM classNameOverride="mt-1">
        Thank you for supporting Gallery. To show our appreciation, enjoy a a free generative
        artwork by MCHX, on us
      </BaseM>
      <Image
        className="w-full aspect-square my-4"
        source={{
          uri: 'https://highlight-creator-assets.highlight.xyz/main/base-dir/0e3a9abb-5b8a-4ecb-92c2-881ef173f299/previews/1.png',
        }}
      />
      <View className="flex flex-row space-apart justify-between">
        <View>
          <BaseM>Open edition</BaseM>
          <BaseM>{timeLeft}</BaseM>
          <BaseM>Limit 1 per Gallery user</BaseM>
        </View>
        <View>
          <TitleLItalic>Gallery x MCHX</TitleLItalic>
        </View>
      </View>
      <View className="my-3">
        <Suspense
          fallback={
            <Button
              text="Mint"
              eventElementId={null}
              eventName={null}
              eventContext={null}
              className="my-2"
              disabled={true}
            />
          }
        >
          <MintButton onPress={handlePress} isClamingMint={isClamingMint} />
        </Suspense>
        {error && <BaseM classNameOverride="text-red">{error}</BaseM>}
      </View>
      <BaseS>
        Note: Image above is an indicative preview only, final artwork will be uniquely generated.
        Powered by highlight.xyz
      </BaseS>
    </View>
  );
}

function MintButton({
  isClamingMint,
  onPress,
}: {
  isClamingMint: boolean;
  onPress: (recipientWalletId: string) => void;
}) {
  const query = useLazyLoadQuery<MintCampaignPreTransactionQuery>(
    graphql`
      query MintCampaignPreTransactionQuery {
        viewer {
          ... on Viewer {
            user {
              primaryWallet {
                dbid
              }
            }
          }
        }
      }
    `,
    {}
  );

  const recipientWalletId = query.viewer.user?.primaryWallet.dbid;

  return (
    <Button
      text={isClamingMint ? 'Minting...' : 'Mint'}
      eventElementId="Mint Campaign Mint Button"
      eventName="Pressed Mint Campaign Mint Button"
      eventContext={contexts.MintCampaign}
      className="my-2"
      onPress={() => onPress(recipientWalletId ?? '')}
      disabled={isClamingMint || !recipientWalletId}
    />
  );
}
