import { useColorScheme } from 'nativewind';
import { useCallback, useMemo } from 'react';
import { Linking, ViewStyle } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { EnsembleIcon } from 'src/icons/EnsembleIcon';
import { FoundationIcon } from 'src/icons/FoundationIcon';
import { FxHashIcon } from 'src/icons/FxHashIcon';
import { HighlightIcon } from 'src/icons/HighlightIcon';
import { MintFunIcon } from 'src/icons/MintFunIcon';
import { ProhibitionIcon } from 'src/icons/ProhibitionIcon';
import { SuperRareIcon } from 'src/icons/SuperRareIcon';
import { TopRightArrowIcon } from 'src/icons/TopRightArrowIcon';
import { ZoraIcon } from 'src/icons/ZoraIcon';

import { MintLinkButtonFragment$key } from '~/generated/MintLinkButtonFragment.graphql';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';
import { Chain } from '~/shared/utils/chains';
import { MINT_LINK_DISABLED_CONTRACTS } from '~/shared/utils/communities';
import { extractRelevantMetadataFromToken } from '~/shared/utils/extractRelevantMetadataFromToken';
import {
  getMintUrlWithReferrer,
  MINT_LINK_CHAIN_ENABLED,
} from '~/shared/utils/getMintUrlWithReferrer';

import { Button, ButtonProps } from './Button';

type Props = {
  // in order to generate the mint URL with the correct params, we either grab it
  // from the token metadata, or if a token is not available (e.g. community page),
  // we use the community metadata. finally, we take into account a mint URL override
  // in the case of a user-provided post.
  tokenRef: MintLinkButtonFragment$key | null;
  overrideMetadata?: {
    contractAddress: string;
    chain: Chain;
    mintUrl: string;
  };
  overrideMintUrl?: string;
  style?: ViewStyle;
  referrerAddress?: string;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  eventContext: GalleryElementTrackingProps['eventContext'];
};

export function MintLinkButton({
  tokenRef,
  overrideMetadata,
  overrideMintUrl,
  style,
  referrerAddress,
  variant = 'primary',
  size = 'md',
  eventContext,
}: Props) {
  const token = useFragment(
    graphql`
      fragment MintLinkButtonFragment on Token {
        ...extractRelevantMetadataFromTokenFragment
      }
    `,
    tokenRef
  );

  const { colorScheme } = useColorScheme();

  const { contractAddress, chain, mintUrl } = useMemo(() => {
    if (token) {
      return extractRelevantMetadataFromToken(token);
    }
    if (overrideMetadata) {
      return overrideMetadata;
    }
    return {
      contractAddress: '',
      chain: '',
      mintUrl: '',
    };
  }, [overrideMetadata, token]);

  const { url: mintURL, provider: mintProviderType } = getMintUrlWithReferrer(
    overrideMintUrl || mintUrl,
    referrerAddress ?? ''
  );

  const mintProvider: {
    buttonText: string;
    icon: React.ReactNode;
  } | null = useMemo(() => {
    if (mintProviderType === 'Zora') {
      return {
        buttonText: 'mint on zora',
        icon: <ZoraIcon />,
      };
    } else if (mintProviderType === 'FxHash') {
      return {
        buttonText: 'mint on fxhash',
        icon: <FxHashIcon />,
      };
    } else if (mintProviderType === 'Prohibition') {
      return {
        buttonText: 'mint on prohibition',
        icon: <ProhibitionIcon />,
      };
    } else if (mintProviderType === 'Ensemble') {
      return {
        buttonText: 'mint on ensemble',
        icon: <EnsembleIcon />,
      };
    } else if (mintProviderType === 'SuperRare') {
      return {
        buttonText: 'mint on superrare',
        icon: <SuperRareIcon width={size === 'sm' ? 16 : 24} height={size === 'sm' ? 16 : 24} />,
      };
    } else if (mintProviderType === 'Highlight') {
      return {
        buttonText: 'mint on highlight',
        icon: <HighlightIcon width={size === 'sm' ? 16 : 24} height={size === 'sm' ? 16 : 24} />,
      };
    } else if (mintProviderType === 'Foundation') {
      return {
        buttonText: 'mint on foundation',
        icon: <FoundationIcon width={size === 'sm' ? 16 : 24} height={size === 'sm' ? 16 : 24} />,
      };
    } else {
      return null;
    }
  }, [mintProviderType, size]);

  const handlePress = useCallback(() => {
    Linking.openURL(mintURL);
  }, [mintURL]);

  const arrowColor = useMemo(() => {
    const colorMap = {
      primary: {
        dark: colors.black[800],
        light: colors.white,
      },
      secondary: {
        dark: colors.white,
        light: colors.black[800],
      },
    };

    return colorMap[variant as 'primary' | 'secondary'][colorScheme === 'dark' ? 'dark' : 'light'];
  }, [variant, colorScheme]);

  if (MINT_LINK_DISABLED_CONTRACTS.has(contractAddress)) {
    return null;
  }

  if (!MINT_LINK_CHAIN_ENABLED.has(chain)) {
    return null;
  }

  if (!mintProvider) {
    return null;
  }

  return (
    <Button
      text={size === 'sm' ? 'mint' : mintProvider.buttonText}
      variant={variant}
      onPress={handlePress}
      headerElement={mintProvider.icon}
      footerElement={<TopRightArrowIcon color={arrowColor} />}
      style={style}
      size={size}
      eventElementId="Mint Link Button"
      eventName="Press Mint Link Button"
      eventContext={eventContext}
      properties={{ provider: mintProviderType, url: mintURL }}
    />
  );
}
