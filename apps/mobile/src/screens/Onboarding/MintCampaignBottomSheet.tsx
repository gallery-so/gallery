import { useCallback, useEffect, useState } from 'react';
import { Image, View } from 'react-native';

import { BaseM, BaseS, TitleLItalic, TitleS } from '~/components/Text';
import { Button } from '~/components/Button';
import { Typography } from '~/components/Typography';
export default function MintCampaignBottomSheet() {
  return <IntroScreen />;
}

export const MCHX_MINT_CAMPAIGN_END_DATE = '2024-03-30T00:00:00-05:00';

function IntroScreen() {
  const calculateTimeLeftText = useCallback(() => {
    const endDate = new Date(MCHX_MINT_CAMPAIGN_END_DATE).getTime();
    const now = new Date().getTime();
    const difference = endDate - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      return `Mint closes in ${days}d ${hours}h ${minutes}m`;
    }

    return 'Campaign ended';
  }, []);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeftText());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeftText());
    }, 60000);

    return () => clearTimeout(timer);
  });
  return (
    <View>
      <TitleS>Exclusive free mint</TitleS>
      <BaseM>
        Thank you for supporting Gallery. To show our appreciation, enjoy a a free generative
        artwork by MCHX, on us
      </BaseM>
      <Image
        className="w-full aspect-square my-4"
        source={{
          uri: 'https://highlight-creator-assets.highlight.xyz/tmp/gen-previews/26666dba-e5ab-4a24-a6ee-af9e358ed115/1710381305822.png',
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
        text="mint"
        eventElementId="Mint Campaign Mint Button"
        eventName="Pressed Mint Campaign Mint Button"
        eventContext={null}
      />
      <BaseS>
        Note: Image above is an indicative preview only, final artwork will be uniquely generated.
        Powered by highlight.xyz
      </BaseS>
    </View>
  );
}
