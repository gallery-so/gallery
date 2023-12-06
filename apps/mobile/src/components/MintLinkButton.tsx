import { useCallback, useMemo } from 'react';
import { Linking } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { MintFunIcon } from 'src/icons/MintFunIcon';
import { TopRightArrowIcon } from 'src/icons/TopRightArrowIcon';
import { ZoraIcon } from 'src/icons/ZoraIcon';

import { MintLinkButtonFragment$key } from '~/generated/MintLinkButtonFragment.graphql';

import { Button } from './Button';

type Props = {
  tokenRef: MintLinkButtonFragment$key;
};

export function MintLinkButton({ tokenRef }: Props) {
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

    if (zoraRegex.test(mintURL)) {
      return {
        name: 'zora',
        icon: <ZoraIcon />,
      };
    } else if (mintFunRegex.test(mintURL)) {
      return {
        name: 'mint.fun',
        icon: <MintFunIcon />,
      };
    }

    return null;
  }, [mintURL]);

  const handlePress = useCallback(() => {
    Linking.openURL(mintURL);
  }, [mintURL]);

  return (
    <Button
      text={`Mint on ${mintProvider?.name}`}
      variant="secondary"
      onPress={handlePress}
      eventElementId={null}
      eventName={null}
      eventContext={null}
      //   icon={<ZoraIcon />}
      icon={mintProvider?.icon}
      footerIcon={<TopRightArrowIcon />}
    />
  );
}
