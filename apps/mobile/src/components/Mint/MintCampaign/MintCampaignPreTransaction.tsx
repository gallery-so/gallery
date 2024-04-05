import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Image, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { contexts } from 'shared/analytics/constants';
import { MCHX_CLAIM_CODE_KEY } from 'src/constants/storageKeys';
import { useHighlightClaimMint } from 'src/hooks/useHighlightClaimMint';
import usePersistedState from 'src/hooks/usePersistedState';

import { Button } from '~/components/Button';
import { BaseM, BaseS, TitleLItalic, TitleS } from '~/components/Text';
import { MintCampaignPreTransactionQuery } from '~/generated/MintCampaignPreTransactionQuery.graphql';

export const MCHX_MINT_CAMPAIGN_END_DATE = '2024-05-05T10:00:00-04:00';

const MCHX_COLLECTION_ID = '660d4342c6bc04d5dc5598e7';

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

  const isMintOver = useMemo(() => {
    const endDate = new Date(MCHX_MINT_CAMPAIGN_END_DATE).getTime();
    const now = new Date().getTime();
    return now > endDate;
  }, []);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeftText());
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeftText());
    }, 60000);

    return () => clearTimeout(timer);
  });

  const { claimMint, isClamingMint } = useHighlightClaimMint();

  const [, setClaimCodeLocalStorage] = usePersistedState(MCHX_CLAIM_CODE_KEY, '');

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
          setClaimCodeLocalStorage(claimCode);
          setClaimCode(claimCode);
        }
      } catch (e: unknown) {
        if (e instanceof Error && e.message === 'ErrHighlightMintUnavailable') {
          setError('Minting is currently unavailable.');
          return;
        }
        if (e instanceof Error && e.message === 'ErrHighlightClaimAlreadyMinted') {
          setError('You have already minted Radiance.');
          return;
        }
        setError('Something went wrong while minting. Please try again.');
      }
    },
    [claimMint, setClaimCode, setClaimCodeLocalStorage]
  );

  return (
    <View>
      <TitleS>Exclusive free mint</TitleS>
      <BaseM classNameOverride="mt-1">
        Thank you for downloading the Gallery app. As a token of our gratitude, we invite you to
        mint Radiance by MCHX, on us.
      </BaseM>
      <Image
        className="w-full aspect-square my-4"
        source={{
          uri: 'https://slack-imgs.com/?c=1&o1=ro&url=https%3A%2F%2Fhighlight-creator-assets.highlight.xyz%2Fmain%2Fimage%2Fad73bc52-3e26-45c7-a73c-3666f165e9fa.png%3Fd%3D1000x1000',
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
          <MintButton onPress={handlePress} isClamingMint={isClamingMint} isMintOver={isMintOver} />
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
  isMintOver,
}: {
  isClamingMint: boolean;
  onPress: (recipientWalletId: string) => void;
  isMintOver: boolean;
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

  const recipientWalletId = query.viewer?.user?.primaryWallet?.dbid;

  return (
    <Button
      text={isClamingMint ? 'Minting...' : 'Mint'}
      eventElementId="Mint Campaign Mint Button"
      eventName="Pressed Mint Campaign Mint Button"
      eventContext={contexts['Mint Campaign']}
      className="my-2"
      onPress={() => onPress(recipientWalletId ?? '')}
      disabled={isClamingMint || !recipientWalletId || isMintOver}
    />
  );
}
