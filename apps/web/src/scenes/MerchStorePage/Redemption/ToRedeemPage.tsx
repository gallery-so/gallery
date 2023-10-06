import { Suspense, useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import Loader from '~/components/core/Loader/Loader';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { ToRedeemPageFragment$key } from '~/generated/ToRedeemPageFragment.graphql';

import { getObjectName } from '../getObjectName';
import RedeemItem from './RedeemItem';
import useRedeemMerch from './useRedeemMerch';

type Props = {
  onToggle: () => void;
  merchTokenRefs: ToRedeemPageFragment$key;
};

export default function ToRedeemPage({ onToggle, merchTokenRefs }: Props) {
  const merchTokens = useFragment(
    graphql`
      fragment ToRedeemPageFragment on MerchToken @relay(plural: true) {
        tokenId

        ...getObjectNameFragment
      }
    `,
    merchTokenRefs
  );

  const [selectedTokenIds, setSelectedTokenIds] = useState<Set<string>>(() => new Set());

  const redeemMerch = useRedeemMerch();
  const { hideModal } = useModalActions();

  const handleItemChange = useCallback(
    (index: number, checked: boolean) => {
      const merchToken = merchTokens[index];

      if (!merchToken) {
        return;
      }

      const newSelectedTokenIds = new Set(selectedTokenIds);
      if (checked) {
        newSelectedTokenIds.add(merchToken.tokenId);
      } else {
        newSelectedTokenIds.delete(merchToken.tokenId);
      }

      setSelectedTokenIds(newSelectedTokenIds);
    },
    [merchTokens, selectedTokenIds]
  );

  const handleSubmit = useCallback(() => {
    const itemIds = [...selectedTokenIds];

    redeemMerch({
      tokenIds: itemIds,
      onSuccess: onToggle,
    });
  }, [onToggle, redeemMerch, selectedTokenIds]);

  const isRedeemButtonDisabled = useMemo(() => {
    return selectedTokenIds.size === 0;
  }, [selectedTokenIds.size]);

  const handleClose = useCallback(() => {
    hideModal();
  }, [hideModal]);

  return (
    <Suspense
      fallback={
        <StyledLoadingContainer grow justify="center" align="center">
          <Loader />
        </StyledLoadingContainer>
      }
    >
      {merchTokens.length > 0 ? (
        <StyledToRedeemPageContainer>
          <VStack>
            <StyledRedeemTextContainer>
              <BaseM>
                Mark the item you want to redeem, and we’ll generate a code that you can use on our
                Shopify store.
              </BaseM>
            </StyledRedeemTextContainer>
            {merchTokens.map((token, index) => {
              const name = getObjectName(token);
              const checked = selectedTokenIds.has(token.tokenId);

              return (
                <RedeemItem
                  key={token.tokenId}
                  index={index}
                  name={name}
                  checked={checked}
                  onChange={handleItemChange}
                />
              );
            })}
          </VStack>

          <StyledRedeemFooter>
            <StyledRedeemSubmitButton
              eventElementId="Redeem Merch Button"
              eventName="Redeem Merch"
              eventContext="Merch Store"
              onClick={handleSubmit}
              disabled={isRedeemButtonDisabled}
            >
              Redeem
            </StyledRedeemSubmitButton>
          </StyledRedeemFooter>
        </StyledToRedeemPageContainer>
      ) : (
        <StyledToRedeemPageContainer>
          <StyledRedeemTextContainer>
            <BaseM>You do not have any merchandise to redeem.</BaseM>
          </StyledRedeemTextContainer>
          <StyledRedeemFooter>
            <StyledRedeemSubmitButton eventElementId={null} eventName={null} onClick={handleClose}>
              Close
            </StyledRedeemSubmitButton>
          </StyledRedeemFooter>
        </StyledToRedeemPageContainer>
      )}
    </Suspense>
  );
}

const StyledToRedeemPageContainer = styled(VStack)`
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
`;

const StyledLoadingContainer = styled(VStack)`
  height: 250px;
`;
