import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, View } from 'react-native';

import { BaseM, BaseS, TitleLItalic, TitleS } from '~/components/Text';
import { Button } from '~/components/Button';
import { Typography } from '~/components/Typography';
import { contexts } from 'shared/analytics/constants';
import { SpinnerIcon } from 'src/icons/SpinnerIcon';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';

type MintState = 'PRE_TXN' | 'TXN_PENDING' | 'TXN_COMPLETE' | 'TOKEN_SYNCED';
export default function MintCampaignBottomSheet() {
  const [state, setState] = useState<MintState>('PRE_TXN');

  const handleTxnComplete = useCallback(() => {
    setState('TXN_COMPLETE');
  }, []);

  if (state === 'PRE_TXN' || state === 'TXN_PENDING') {
    return <PreTransactionScreen onTransactionSuccess={handleTxnComplete} />;
  } else if (state === 'TXN_COMPLETE' || state === 'TOKEN_SYNCED') {
    return <PostTransactionScreen />;
  }
}

export const MCHX_MINT_CAMPAIGN_END_DATE = '2024-03-30T00:00:00-05:00';

function PreTransactionScreen({ onTransactionSuccess }: { onTransactionSuccess: () => void }) {
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

  const [mintPending, setMintPending] = useState(false);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeftText());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeftText());
    }, 60000);

    return () => clearTimeout(timer);
  });

  //   TXN_PENDING
  //   TXN_COMPLETE
  //   TOKEN_SYNCED

  const handlePress = useCallback(() => {
    console.log('mint');
    setMintPending(true);

    setTimeout(() => {
      onTransactionSuccess();
    }, 2000);

    // trigger mint mutation
    //
  }, [onTransactionSuccess]);
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
      <Button
        text={mintPending ? 'Minting...' : 'Mint'}
        eventElementId="Mint Campaign Mint Button"
        eventName="Pressed Mint Campaign Mint Button"
        eventContext={contexts.MintCampaign}
        className="my-3"
        onPress={handlePress}
        disabled={mintPending}
      />
      <BaseS>
        Note: Image above is an indicative preview only, final artwork will be uniquely generated.
        Powered by highlight.xyz
      </BaseS>
    </View>
  );
}

function PostTransactionScreen() {
  const [state, setState] = useState<MintState>('TXN_COMPLETE');

  const handlePostPress = useCallback(() => {
    // handlePress
  }, []);

  const handleSeeCollectionPress = useCallback(() => {
    // handlePress
  }, []);

  const testHandler = useCallback(() => {
    console.log('test');
    if (state === 'TXN_COMPLETE') {
      setState('TOKEN_SYNCED');
    } else {
      setState('TXN_COMPLETE');
    }
  }, [state]);

  return (
    <View>
      <TitleS>{state === 'TOKEN_SYNCED' ? 'Mint revealed' : 'Mint confirmed'}</TitleS>
      <BaseM>{state === 'TOKEN_SYNCED' ? 'Token ID here' : 'Revealing your artwork'}</BaseM>
      {state === 'TOKEN_SYNCED' ? (
        <Image
          className="w-full aspect-square my-4"
          source={{
            uri: 'https://highlight-creator-assets.highlight.xyz/tmp/gen-previews/cb47e6ac-93f0-41e9-b8a7-ae85f5bff594/1710746816957.png',
          }}
        />
      ) : (
        <View className="my-4 flex justify-center items-center bg-faint dark:bg-black-700 w-full aspect-square ">
          <GalleryTouchableOpacity onPress={testHandler}>
            <SpinnerIcon spin size="s" />
          </GalleryTouchableOpacity>
        </View>
      )}
      {state === 'TOKEN_SYNCED' && (
        <>
          <Button
            text="Post"
            eventElementId="Mint Campaign Post Button"
            eventName="Pressed Mint Campaign Post Button"
            eventContext={contexts.MintCampaign}
            className="mb-2"
            onPress={handlePostPress}
          />
          <Button
            text="See collection"
            variant="secondary"
            eventElementId="Mint Campaign See Collection Button"
            eventName="Pressed Mint Campaign See Collection Button"
            eventContext={contexts.MintCampaign}
            onPress={handleSeeCollectionPress}
          />
        </>
      )}
    </View>
  );
}
