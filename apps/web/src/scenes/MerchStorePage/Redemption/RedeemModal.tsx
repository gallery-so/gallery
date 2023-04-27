import { useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleXS } from '~/components/core/Text/Text';
import { MerchType } from '~/generated/getObjectNameFragment.graphql';
import { RedeemModalQueryFragment$key } from '~/generated/RedeemModalQueryFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';

import RedeemedPage from './RedeemedPage';
import ToRedeemPage from './ToRedeemPage';

type RedeemTab = 'to redeem' | 'redeemed';

export type MerchToken = {
  discountCode: string | null;
  objectType: MerchType;
  redeemed: boolean;
  tokenId: string;
  name?: string;
};

type Props = {
  queryRef: RedeemModalQueryFragment$key;
};

export default function RedeemModal({ queryRef }: Props) {
  const merchTokensPayload = useFragment(
    graphql`
      fragment RedeemModalQueryFragment on MerchTokensPayload {
        tokens {
          redeemed

          ...RedeemedPageFragment
          ...ToRedeemPageFragment
        }
      }
    `,
    queryRef
  );

  const { tokens } = merchTokensPayload;

  const [activeTab, setActiveTab] = useState<RedeemTab>('to redeem');

  const toggleTab = () => {
    setActiveTab(activeTab === 'to redeem' ? 'redeemed' : 'to redeem');
  };

  const nonNullTokens = useMemo(() => removeNullValues(tokens), [tokens]);

  const redeemableTokens = useMemo(
    () => nonNullTokens.filter((token) => !token.redeemed),
    [nonNullTokens]
  );

  const redeemedTokens = useMemo(
    () => nonNullTokens.filter((token) => token.redeemed),
    [nonNullTokens]
  );

  return (
    <StyledRedeemModal>
      <StyledRedeemHeaderContainer gap={16}>
        <StyledRedeemTab active={activeTab === 'to redeem'} onClick={toggleTab}>
          <TitleXS>to redeem {activeTab === 'to redeem'}</TitleXS>
        </StyledRedeemTab>
        <StyledRedeemTab active={activeTab === 'redeemed'} onClick={toggleTab}>
          <TitleXS>redeemed {activeTab === 'redeemed'}</TitleXS>
        </StyledRedeemTab>
      </StyledRedeemHeaderContainer>
      {activeTab === 'to redeem' ? (
        <ToRedeemPage merchTokenRefs={redeemableTokens} onToggle={toggleTab} />
      ) : (
        <RedeemedPage merchTokenRefs={redeemedTokens} />
      )}
    </StyledRedeemModal>
  );
}

const StyledRedeemModal = styled(VStack)`
  width: 480px;
  min-height: 250px;
`;

const StyledRedeemHeaderContainer = styled(HStack)`
  padding-bottom: 16px;
`;
const StyledRedeemTab = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: inherit;

  text-transform: uppercase;

  ${TitleXS} {
    color: ${({ active }) => (active ? colors.offBlack : colors.metal)};
  }
`;
