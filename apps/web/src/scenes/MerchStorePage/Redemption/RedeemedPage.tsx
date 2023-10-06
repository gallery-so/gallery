import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { RedeemedPageFragment$key } from '~/generated/RedeemedPageFragment.graphql';
import ArrowUpRightIcon from '~/icons/ArrowUpRightIcon';
import { contexts } from '~/shared/analytics/constants';

import { REDEEMED_STATUS } from '../constants';
import { getObjectName } from '../getObjectName';
import RedeemedItem from './RedeemedItem';

type Props = {
  merchTokenRefs: RedeemedPageFragment$key;
};

export default function RedeemedPage({ merchTokenRefs }: Props) {
  const merchTokens = useFragment(
    graphql`
      fragment RedeemedPageFragment on MerchToken @relay(plural: true) {
        tokenId
        discountCode
        ...getObjectNameFragment
      }
    `,
    merchTokenRefs
  );

  const { hideModal } = useModalActions();

  const handleRedeem = useCallback(() => {
    window.open('https://shopify.gallery.so', '_blank');
  }, []);

  const handleClose = useCallback(() => {
    hideModal();
  }, [hideModal]);

  return (
    <>
      {merchTokens.length > 0 ? (
        <StyledRedeemedPageContainer>
          <VStack>
            <StyledRedeemTextContainer>
              <BaseM>Copy the codes to use on our Shopify shop.</BaseM>
            </StyledRedeemTextContainer>
            {merchTokens.map((token) => {
              const name = getObjectName(token);

              return (
                <RedeemedItem
                  key={token.tokenId}
                  name={name}
                  // if the backend returns a redeemed token but no discount code, this means
                  // the token was manually marked as redeemed on the user's behalf (e.g. free
                  // giveaway from NFT NYC). this prevents the user from redeeming further merch
                  // from NFTs they'd received in the past.
                  discountCode={token.discountCode || REDEEMED_STATUS}
                />
              );
            })}
          </VStack>
          <StyledRedeemFooter>
            <StyledRedeemSubmitButton
              eventElementId="Redeem on Shopify Button"
              eventName="Redeem on Shopify"
              eventContext={contexts['Merch Store']}
              onClick={handleRedeem}
            >
              <HStack gap={4} align="center">
                Redeem on shopify
                <ArrowUpRightIcon />
              </HStack>
            </StyledRedeemSubmitButton>
          </StyledRedeemFooter>
        </StyledRedeemedPageContainer>
      ) : (
        <StyledRedeemedPageContainer>
          <BaseM>You have not redeemed any items yet.</BaseM>
          <StyledRedeemFooter>
            <StyledRedeemSubmitButton
              eventElementId={null}
              eventName={null}
              eventContext={null}
              onClick={handleClose}
            >
              <HStack gap={4} align="center">
                Close
              </HStack>
            </StyledRedeemSubmitButton>
          </StyledRedeemFooter>
        </StyledRedeemedPageContainer>
      )}
    </>
  );
}

const StyledRedeemedPageContainer = styled(VStack)`
  flex: 1;
  justify-content: space-between;
`;

const StyledRedeemTextContainer = styled.div`
  padding-bottom: 16px;
`;

const StyledRedeemFooter = styled.div`
  padding: 12px 0;
`;

const StyledRedeemSubmitButton = styled(Button)`
  width: 100%;
  text-transform: uppercase;
`;
