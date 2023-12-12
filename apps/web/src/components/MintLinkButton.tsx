import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { MintLinkButtonFragment$key } from '~/generated/MintLinkButtonFragment.graphql';
import { FxHashLogoIcon } from '~/icons/FxHashLogoIcon';
import { MintFunLogoIcon } from '~/icons/MintFunLogoIcon';
import { ProhibitionLogoIcon } from '~/icons/ProhibitionLogoIcon';
import { ZoraLogoIcon } from '~/icons/ZoraLogoIcon';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';
import { MINT_LINK_DISABLED_CONTRACTS } from '~/shared/utils/communities';
import {
  MINT_LINK_CHAIN_ENABLED,
  getMintUrlWithReferrer,
} from '~/shared/utils/getMintUrlWithReferrer';

import { Button, ButtonProps } from './core/Button/Button';
import VerifyNavigationPopover from './core/GalleryLink/VerifyNavigationPopover';
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
        }
      }
    `,
    tokenRef
  );

  const { showModal } = useModalActions();

  const tokenContractAddress =
    token?.definition?.community?.contract?.contractAddress?.address ?? '';
  const tokenChain = token?.definition?.community?.contract?.contractAddress?.chain ?? '';
  const { url: mintURL, provider: mintProviderType } = getMintUrlWithReferrer(
    overwriteURL ?? token?.definition?.community?.contract?.mintURL ?? '',
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
    } else {
      return null;
    }
  }, [mintProviderType, variant]);

  const handleMintButtonClick = useCallback(() => {
    showModal({
      content: <VerifyNavigationPopover href={mintURL} eventContext={contexts.Feed} />,
      isFullPage: false,
      headerText: 'Leaving gallery.so?',
    });
  }, [mintURL, showModal]);

  const arrowColor = useMemo(() => {
    if (variant === 'primary') {
      return colors.white;
    }
    return colors.black[800];
  }, [variant]);

  if (MINT_LINK_DISABLED_CONTRACTS.has(tokenContractAddress)) {
    return null;
  }

  if (MINT_LINK_CHAIN_ENABLED.indexOf(tokenChain) < 0) {
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
