import { useColorScheme } from 'nativewind';
import { useCallback, useMemo } from 'react';
import { Linking, ViewStyle } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { MintFunIcon } from 'src/icons/MintFunIcon';
import { TopRightArrowIcon } from 'src/icons/TopRightArrowIcon';
import { ZoraIcon } from 'src/icons/ZoraIcon';
import { getMintUrlWithReferrer } from 'src/utils/getMintUrlWithReferrer';

import { MintLinkButtonFragment$key } from '~/generated/MintLinkButtonFragment.graphql';
import colors from '~/shared/theme/colors';
import { MINT_LINK_DISABLED_CONTRACTS } from '~/shared/utils/communities';

import { Button, ButtonProps } from './Button';

type Props = {
  tokenRef: MintLinkButtonFragment$key;
  style?: ViewStyle;
  referrerAddress?: string;
} & ButtonProps;

const CHAIN_ENABLED = ['Ethereum', 'Optimism', 'Base', 'Zora'];

export function MintLinkButton({
  tokenRef,
  referrerAddress,
  style,
  variant = 'primary',
  size = 'md',
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
    token?.definition?.community?.contract?.mintURL ?? '',
    referrerAddress ?? ''
  );

  const mintProvider = useMemo(() => {
    const provider = {
      name: '',
      icon: null as React.ReactNode | null,
    };

    if (size === 'sm') {
      provider.name = 'mint';
    } else if (mintProviderType === 'Zora') {
      provider.name = 'mint on zora';
    } else if (mintProviderType === 'MintFun') {
      provider.name = 'mint on mint.fun';
    }

    if (mintProviderType === 'Zora') {
      provider.icon = <ZoraIcon />;
    } else if (mintProviderType === 'MintFun') {
      provider.icon = (
        <MintFunIcon width={size === 'sm' ? 16 : 24} height={size === 'sm' ? 16 : 24} />
      );
    }

    return provider;
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

  if (CHAIN_ENABLED.indexOf(tokenChain) < 0) {
    return null;
  }

  return (
    <Button
      text={mintProvider?.name}
      variant={variant}
      onPress={handlePress}
      headerElement={mintProvider?.icon}
      footerElement={<TopRightArrowIcon color={arrowColor} />}
      style={style}
      size={size}
      {...props}
    />
  );
}
