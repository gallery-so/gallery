import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { BaseM, BaseS, TitleLItalic, TitleS } from '~/components/Text';
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
      <BaseS>
        Note: Image above is an indicative preview only, final artwork will be uniquely generated.
        Powered by highlight.xyz
      </BaseS>
    </View>
  );
}
