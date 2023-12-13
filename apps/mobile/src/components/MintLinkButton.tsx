import { useColorScheme } from 'nativewind';
import { useCallback, useMemo } from 'react';
import { Linking, ViewStyle } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { EnsembleIcon } from 'src/icons/EnsembleIcon';
import { FxHashIcon } from 'src/icons/FxHashIcon';
import { MintFunIcon } from 'src/icons/MintFunIcon';
import { ProhibitionIcon } from 'src/icons/ProhibitionIcon';
import { TopRightArrowIcon } from 'src/icons/TopRightArrowIcon';
import { ZoraIcon } from 'src/icons/ZoraIcon';

import { MintLinkButtonFragment$key } from '~/generated/MintLinkButtonFragment.graphql';
import colors from '~/shared/theme/colors';
import { MINT_LINK_DISABLED_CONTRACTS } from '~/shared/utils/communities';
import {
  getMintUrlWithReferrer,
  MINT_LINK_CHAIN_ENABLED,
} from '~/shared/utils/getMintUrlWithReferrer';

import { Button, ButtonProps } from './Button';

type Props = {
  tokenRef: MintLinkButtonFragment$key;
  style?: ViewStyle;
  referrerAddress?: string;
  overwriteURL?: string;
} & ButtonProps;

export function MintLinkButton({
  tokenRef,
  referrerAddress,
  style,
  variant = 'primary',
  size = 'md',
  overwriteURL,
  ...props
}: Props) {
  const token = useFragment(
    graphql`
      fragment MintLinkButtonFragment on Token {
        definition {
          community {
            contract {
              mintURL
              contractAddress {
                chain
                address
              }
            }
          }
        }
      }
    `,
    tokenRef
  );
  const { colorScheme } = useColorScheme();

  const tokenContractAddress =
    token?.definition?.community?.contract?.contractAddress?.address ?? '';
  const tokenChain = token?.definition?.community?.contract?.contractAddress?.chain ?? '';
  const { url: mintURL, provider: mintProviderType } = getMintUrlWithReferrer(
    overwriteURL || (token?.definition?.community?.contract?.mintURL ?? ''),
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
    } else if (mintProviderType === 'MintFun') {
      return {
        buttonText: 'mint on mint.fun',
        icon: <MintFunIcon width={size === 'sm' ? 16 : 24} height={size === 'sm' ? 16 : 24} />,
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

  if (MINT_LINK_DISABLED_CONTRACTS.has(tokenContractAddress)) {
    return null;
  }

  if (!MINT_LINK_CHAIN_ENABLED.has(tokenChain)) {
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
      {...props}
    />
  );
}
