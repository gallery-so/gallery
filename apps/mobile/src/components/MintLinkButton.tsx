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
} & ButtonProps;

export function MintLinkButton({
  tokenRef,
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

  const mintURL = token?.definition?.community?.contract?.mintURL ?? '';

  const mintProvider = useMemo(() => {
    const mintFunRegex = new RegExp('https://mint.fun/');
    const zoraRegex = new RegExp('https://zora.co/');

    const provider = {
      name: '',
      icon: null as React.ReactNode | null,
    };

    if (size === 'sm') {
      provider.name = 'mint';
    } else if (zoraRegex.test(mintURL)) {
      provider.name = 'mint on zora';
    } else if (mintFunRegex.test(mintURL)) {
      provider.name = 'mint on mint.fun';
    }

    if (zoraRegex.test(mintURL)) {
      provider.icon = <ZoraIcon />;
    } else if (mintFunRegex.test(mintURL)) {
      provider.icon = (
        <MintFunIcon width={size === 'sm' ? 16 : 24} height={size === 'sm' ? 16 : 24} />
      );
    }

    return provider;
  }, [mintURL, size]);

  const handlePress = useCallback(() => {
    Linking.openURL(mintURL);
  }, [mintURL]);

  return (
    <Button
      text={mintProvider?.name}
      variant={variant}
      onPress={handlePress}
      icon={mintProvider?.icon}
      footerIcon={
        <TopRightArrowIcon color={variant === 'primary' ? colors.white : colors.black[800]} />
      }
      style={style}
      size={size}
      {...props}
    />
  );
}
