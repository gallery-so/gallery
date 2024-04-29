import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Image, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { contexts } from 'shared/analytics/constants';
import { useHighlightClaimMint } from 'src/hooks/useHighlightClaimMint';
import usePersistedState from 'src/hooks/usePersistedState';

import { Button } from '~/components/Button';
import { BaseM, BaseS, TitleLItalic, TitleS } from '~/components/Text';
import { MintProject } from '~/contexts/SanityDataContext';
import { MintCampaignPreTransactionQuery } from '~/generated/MintCampaignPreTransactionQuery.graphql';

export default function MintCampaignPreTransaction({
  setClaimCode,
  projectInternalId,
  projectData,
}: {
  setClaimCode: (claimCode: string) => void;
  projectInternalId: string;
  projectData: MintProject;
}) {
  const calculateTimeLeftText = useCallback(() => {
    const endDate = new Date(projectData.endDate).getTime();
    const now = new Date().getTime();
    const difference = endDate - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      return `Ending ${days}d ${hours}h ${minutes}m`;
    }

    return 'Campaign ended';
  }, [projectData.endDate]);

  const isMintOver = useMemo(() => {
    const endDate = new Date(projectData.endDate).getTime();
    const now = new Date().getTime();
    return now > endDate;
  }, [projectData.endDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeftText());
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeftText());
    }, 60000);

    return () => clearTimeout(timer);
  });

  const { claimMint, isClamingMint } = useHighlightClaimMint();

  const [, setClaimCodeLocalStorage] = usePersistedState(`${projectInternalId}_claim_code`, '');

  const handlePress = useCallback(
    async (recipientWalletId: string) => {
      if (!recipientWalletId) {
        return;
      }

      try {
        const claimCode = await claimMint({
          collectionId: projectData.highlightProjectId,
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
    [claimMint, projectData.highlightProjectId, setClaimCode, setClaimCodeLocalStorage]
  );

  return (
    <View>
      <TitleS>{projectData.title}</TitleS>
      <BaseM classNameOverride="mt-1">{projectData.description}</BaseM>
      <Image
        className="w-full aspect-square my-4"
        source={{
          uri: projectData.previewImageUrl,
        }}
      />
      <View className="flex flex-row space-apart justify-between">
        <View>
          <BaseM>Open edition</BaseM>
          <BaseM>{timeLeft}</BaseM>
          <BaseM>Limit 1 per user</BaseM>
        </View>
        <View>
          <TitleLItalic>Gallery x {projectData.artistName}</TitleLItalic>
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
        Note: Image above is an indicative preview only, final artwork will be randomly generated.
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
                chain
              }
              wallets {
                dbid
                chain
              }
            }
          }
        }
      }
    `,
    {}
  );

  // Since the mint is only available for Ethereum addresses, look for the first connected Eth wallet starting with the primary wallet
  const recipientWalletId = useMemo(() => {
    const user = query.viewer?.user;
    if (!user) {
      return;
    }
    if (user.primaryWallet?.chain === 'Ethereum') {
      return user.primaryWallet?.dbid;
    }

    return user.wallets?.find((wallet) => wallet?.chain === 'Ethereum')?.dbid;
  }, [query.viewer?.user]);

  return (
    <>
      <Button
        text={isClamingMint ? 'Minting...' : 'Mint'}
        eventElementId="Mint Campaign Mint Button"
        eventName="Pressed Mint Campaign Mint Button"
        eventContext={contexts['Mint Campaign']}
        className="my-2"
        onPress={() => onPress(recipientWalletId ?? '')}
        disabled={isClamingMint || !recipientWalletId || isMintOver}
      />
      {!recipientWalletId && (
        <BaseM classNameOverride="text-red">
          Please connect an Ethereum address to your account to mint.
        </BaseM>
      )}
    </>
  );
}
