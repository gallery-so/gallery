import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { MintLinkButtonFragment$key } from '~/generated/MintLinkButtonFragment.graphql';
import { EnsembleLogoIcon } from '~/icons/EnsembleLogoIcon';
import { FxHashLogoIcon } from '~/icons/FxHashLogoIcon';
import { HighlightLogoIcon } from '~/icons/HighlightLogoIcon';
import { MintFunLogoIcon } from '~/icons/MintFunLogoIcon';
import { ProhibitionLogoIcon } from '~/icons/ProhibitionLogoIcon';
import { SuperRareLogoIcon } from '~/icons/SuperRareLogoIcon';
import { ZoraLogoIcon } from '~/icons/ZoraLogoIcon';
import colors from '~/shared/theme/colors';
import { MINT_LINK_DISABLED_CONTRACTS } from '~/shared/utils/communities';
import {
  getMintUrlWithReferrer,
  MINT_LINK_CHAIN_ENABLED,
} from '~/shared/utils/getMintUrlWithReferrer';

import { Button, ButtonProps } from './core/Button/Button';
import { HStack } from './core/Spacer/Stack';

type Props = {
  tokenRef: MintLinkButtonFragment$key;
  overwriteURL?: string;
  referrerAddress?: string;
  size?: 'sm' | 'md';
} & ButtonProps;

export function MintLinkButton({
  overwriteURL,
  referrerAddress,
  tokenRef,
  size = 'md',
  variant = 'primary',
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
          mintUrl
        }
      }
    `,
    tokenRef
  );

  const tokenContractAddress =
    token?.definition?.community?.contract?.contractAddress?.address ?? '';
  const tokenChain = token?.definition?.community?.contract?.contractAddress?.chain ?? '';
  const { url: mintURL, provider: mintProviderType } = getMintUrlWithReferrer(
    overwriteURL ||
      (token?.definition?.mintUrl ?? token?.definition?.community?.contract?.mintURL ?? ''),
    referrerAddress ?? ''
  );

  const mintProvider: {
    buttonText: string;
    icon: React.ReactNode;
  } | null = useMemo(() => {
    if (mintProviderType === 'Zora') {
      return {
        buttonText: 'mint on zora',
        icon: <ZoraLogoIcon />,
      };
    } else if (mintProviderType === 'MintFun') {
      return {
        buttonText: 'mint on mint.fun',
        icon: <MintFunLogoIcon />,
      };
    } else if (mintProviderType === 'FxHash') {
      return {
        buttonText: 'mint on fxhash',
        icon: <FxHashLogoIcon mode={variant === 'primary' ? 'light' : 'dark'} />,
      };
    } else if (mintProviderType === 'Prohibition') {
      return {
        buttonText: 'mint on prohibition',
        icon: <ProhibitionLogoIcon mode={variant === 'primary' ? 'light' : 'dark'} />,
      };
    } else if (mintProviderType === 'Ensemble') {
      return {
        buttonText: 'mint on ensemble',
        icon: <EnsembleLogoIcon />,
      };
    } else if (mintProviderType === 'SuperRare') {
      return {
        buttonText: 'mint on superrare',
        icon: <SuperRareLogoIcon mode={variant === 'primary' ? 'light' : 'dark'} />,
      };
    } else if (mintProviderType === 'Highlight') {
      return {
        buttonText: 'mint on highlight',
        icon: <HighlightLogoIcon mode={variant === 'primary' ? 'light' : 'dark'} />,
      };
    } else {
      return null;
    }
  }, [mintProviderType, variant]);

  const handleMintButtonClick = useCallback(() => {
    window.open(mintURL);
  }, [mintURL]);

  const arrowColor = useMemo(() => {
    if (variant === 'primary') {
      return colors.white;
    }
    return colors.black[800];
  }, [variant]);

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
    <Button onClick={handleMintButtonClick} variant={variant} {...props}>
      <HStack gap={4} align="center">
        <HStack gap={8} align="center">
          {mintProvider?.icon}

          {size === 'sm' ? 'mint' : mintProvider?.buttonText}
        </HStack>

        <svg
          width="11"
          height="11"
          viewBox="0 0 11 11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 1.33301H9.66667V7.99967" stroke={arrowColor} stroke-miterlimit="10" />
          <path d="M9.66667 1.33301L1 9.99967" stroke={arrowColor} stroke-miterlimit="10" />
        </svg>
      </HStack>
    </Button>
  );
}