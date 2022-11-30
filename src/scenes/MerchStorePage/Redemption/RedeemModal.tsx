import { useState } from 'react';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleXS } from '~/components/core/Text/Text';

import RedeemedPage from './RedeemedPage';
import ToRedeemPage from './ToRedeemPage';

type RedeemTab = 'to redeem' | 'redeemed';

export default function RedeemModal() {
  const [activeTab, setActiveTab] = useState<RedeemTab>('to redeem');

  const toggleTab = () => {
    setActiveTab(activeTab === 'to redeem' ? 'redeemed' : 'to redeem');
  };

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
      {activeTab === 'to redeem' ? <ToRedeemPage /> : <RedeemedPage />}
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
