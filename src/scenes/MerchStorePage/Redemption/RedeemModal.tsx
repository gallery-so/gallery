import { useMemo, useState } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import { useAccount } from 'wagmi';

import colors from '~/components/core/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleXS } from '~/components/core/Text/Text';
import { MerchType, RedeemModalQuery } from '~/generated/RedeemModalQuery.graphql';

import RedeemedPage from './RedeemedPage';
import ToRedeemPage from './ToRedeemPage';

type RedeemTab = 'to redeem' | 'redeemed';

const MERCHS_NAMING = {
  TShirt: '(OBJECT 001) Shirt',
  Hat: '(OBJECT 002) hat',
  Card: '(OBJECT 003) card ',
};

export type MerchToken = {
  discountCode: string | null;
  objectType: MerchType;
  redeemed: boolean;
  tokenId: string;
  name?: string;
};

export default function RedeemModal() {
  const { address } = useAccount();

  const query = useLazyLoadQuery<RedeemModalQuery>(
    graphql`
      query RedeemModalQuery($wallet: Address!) {
        merchTokens: getMerchTokens(wallet: $wallet) {
          __typename
          ... on MerchTokensPayload {
            tokens {
              ... on MerchToken {
                tokenId
                objectType
                discountCode
                redeemed
              }
            }
          }
        }
      }
    `,
    {
      wallet: address ?? '',
    }
  );

  const { merchTokens } = query;

  // add name key to each merchTokens
  const formattedTokens = useMemo(() => {
    if (merchTokens?.__typename !== 'MerchTokensPayload') return [];

    return merchTokens?.tokens?.map((token) => {
      if (token) {
        return {
          ...token,
          name: MERCHS_NAMING[token.objectType as keyof typeof MERCHS_NAMING],
        };
      }
      return null;
    });
  }, [merchTokens]);

  console.log(formattedTokens);

  const [activeTab, setActiveTab] = useState<RedeemTab>('to redeem');

  const toggleTab = () => {
    setActiveTab(activeTab === 'to redeem' ? 'redeemed' : 'to redeem');
  };

  // filter the tokens by redeemed status
  const redeemableTokens = useMemo(() => {
    const tokens = [];

    for (const token of formattedTokens ?? []) {
      if (token && !token.redeemed) {
        tokens.push(token);
      }
    }

    return tokens;
  }, [formattedTokens]);

  const redeemedTokens = useMemo(() => {
    const tokens = [];

    for (const token of formattedTokens ?? []) {
      if (token && token.redeemed) {
        tokens.push(token);
      }
    }

    return tokens;
  }, [formattedTokens]);

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
        <ToRedeemPage tokens={redeemableTokens} />
      ) : (
        <RedeemedPage tokens={redeemedTokens} />
      )}
    </StyledRedeemModal>
  );
}

const StyledRedeemModal = styled(VStack)`
  width: 480px;
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
