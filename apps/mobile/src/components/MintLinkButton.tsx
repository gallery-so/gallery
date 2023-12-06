import { useColorScheme } from 'nativewind';
import { useCallback, useMemo } from 'react';
import { Linking, ViewStyle } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { MintFunIcon } from 'src/icons/MintFunIcon';
import { TopRightArrowIcon } from 'src/icons/TopRightArrowIcon';
import { ZoraIcon } from 'src/icons/ZoraIcon';

import { MintLinkButtonFragment$key } from '~/generated/MintLinkButtonFragment.graphql';
import colors from '~/shared/theme/colors';

import { Button, ButtonProps } from './Button';

type Props = {
  tokenRef: MintLinkButtonFragment$key;
  style?: ViewStyle;
  referrerAddress?: string;
} & ButtonProps;

type MintProvider = 'Zora' | 'MintFun' | '';

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
            }
          }
        }
      }
    `,
    tokenRef
  );
  const { colorScheme } = useColorScheme();

  const mintProviderType = useMemo((): MintProvider => {
    const mintFunRegex = new RegExp('https://mint.fun/');
    const zoraRegex = new RegExp('https://zora.co/');

    const mintUrl = token?.definition?.community?.contract?.mintURL ?? '';

    if (zoraRegex.test(mintUrl)) {
      return 'Zora';
    } else if (mintFunRegex.test(mintUrl)) {
      return 'MintFun';
    }

    return '';
  }, [token]);

  const mintURL = useMemo(() => {
    const url = token?.definition?.community?.contract?.mintURL ?? '';

    if (!referrerAddress) {
      return url;
    }

    if (mintProviderType === 'MintFun') {
      return `${url}?ref=${referrerAddress}`;
    }

    if (mintProviderType === 'Zora') {
      return `${url}?referrer=${referrerAddress}`;
    }

    return url;
  }, [mintProviderType, referrerAddress, token]);

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

  return (
    <Button
      text={mintProvider?.name}
      variant={variant}
      onPress={handlePress}
      icon={mintProvider?.icon}
      footerIcon={<TopRightArrowIcon color={arrowColor} />}
      style={style}
      size={size}
      {...props}
    />
  );
}
