import React, { useCallback } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';
import { useAccount } from 'wagmi';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleM, TitleMonoM } from '~/components/core/Text/Text';
import { GLOBAL_FOOTER_HEIGHT } from '~/contexts/globalLayout/GlobalFooter/GlobalFooter';
import { MerchStorePageQuery } from '~/generated/MerchStorePageQuery.graphql';
import { MerchStorePageQueryFragment$key } from '~/generated/MerchStorePageQueryFragment.graphql';
import useUniversalAuthModal from '~/hooks/useUniversalAuthModal';
import LogoBracketLeft from '~/icons/LogoBracketLeft';
import LogoBracketRight from '~/icons/LogoBracketRight';
import { contexts } from '~/shared/analytics/constants';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import colors from '~/shared/theme/colors';

import Countdown from './Countdown';
import ListMerchItems from './ListMerchItems';
import useRedeemModal from './Redemption/useRedeemModal';

export type MerchItemTypes = {
  label: string;
  image: string;
  title: string;
  description: string;
  price: string;
  tokenId: number;
};

export const merchItems = [
  {
    label: 'Shirt',
    image: '/merch/shirt',
    title: '(Object 001)',
    description:
      'Black short sleeve cotton t-shirt with puff-print design on left chest and both puff-print and screen-print design on full back.\nThe first entry in the (OBJECTS) Gallery merch collection.\nThis token may be used to claim 1 physical corresponding merch item during the redemption period.',
    price: '0.05',
    tokenId: 0,
    type: 'TShirt',
  },
  {
    label: 'Hat',
    image: '/merch/hat',
    title: '(Object 002)',
    description:
      'Black hat with embroidered text design at center front and embroidered Gallery logo at center back.\nThe second entry in the (OBJECTS) Gallery merch collection.\nThis token may be used to claim 1 physical corresponding merch item during the redemption period.',
    price: '0.06',
    tokenId: 1,
    type: 'Hat',
  },
  {
    label: 'Card',
    image: '/merch/card',
    title: '(Object 003)',
    description:
      'Metallic membership card laser etched with the Gallery logo on the front and text design on the back.\nThe third entry in the (OBJECTS) Gallery merch collection.\nThis token may be used to claim 1 physical corresponding merch item during the redemption period.',
    price: '0.08',
    tokenId: 2,
    type: 'Card',
  },
];

type Props = {
  queryRef: MerchStorePageQueryFragment$key;
};

export default function MerchStorePage({ queryRef }: Props) {
  const { address } = useAccount();
  const query = useLazyLoadQuery<MerchStorePageQuery>(
    graphql`
      query MerchStorePageQuery($wallet: Address!) {
        merchTokens: getMerchTokens(wallet: $wallet) @required(action: THROW) {
          __typename
          ...useRedeemModalQueryFragment
          ...ListMerchItemsFragment
        }

        viewer {
          ... on Viewer {
            __typename
          }
        }
      }
    `,
    {
      wallet: address ?? '',
    }
  );

  const userQuery = useFragment(
    graphql`
      fragment MerchStorePageQueryFragment on Query {
        ...useLoggedInUserIdFragment
      }
    `,
    queryRef
  );

  const { merchTokens } = query;
  const showAuthModal = useUniversalAuthModal();
  const showRedeemModal = useRedeemModal(merchTokens);

  const loggedInUserId = useLoggedInUserId(userQuery);

  const handleShowRedeemModal = useCallback(() => {
    if (!loggedInUserId) {
      showAuthModal();
      return;
    }

    showRedeemModal();
  }, [loggedInUserId, showRedeemModal, showAuthModal]);

  return (
    <StyledPage>
      <Countdown />
      <StyledLogoContainer>
        <StyledLogoBracketLeft color={colors.black['800']} />
        <HStack gap={1}>
          <StyledShopText>OBJECTS</StyledShopText>
          <StyledLogoBracketRight color={colors.black['800']} />
        </HStack>
      </StyledLogoContainer>
      <StyledButtonContainer>
        <StyledButton
          eventElementId="Redeem Merch Upsell Button"
          eventName="Redeem Merch Upsell"
          eventContext={contexts['Merch Store']}
          onClick={handleShowRedeemModal}
        >
          Redeem
        </StyledButton>
      </StyledButtonContainer>
      <StyledContent gap={32} align="center">
        <TitleMonoM>Physical redemption is now available.</TitleMonoM>
        <ListMerchItems queryRef={merchTokens} />
      </StyledContent>
    </StyledPage>
  );
}

const StyledPage = styled.div`
  min-height: calc(100vh - ${GLOBAL_FOOTER_HEIGHT}px);
  padding: 20px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
`;

const StyledLogoContainer = styled.div`
  position: absolute;
  top: 16px;
  height: 32px;
  display: flex;
  align-items: center;
`;

const StyledButtonContainer = styled.div`
  position: absolute;
  top: 16px;
  right: 24px;
  height: 32px;
  display: flex;
  align-items: center;
`;

const StyledButton = styled(Button)`
  padding: 10px 12px;
`;

const StyledContent = styled(VStack)`
  padding-top: 80px;
  width: 100%;

  @media only screen and ${breakpoints.tablet} {
    padding-top: 0;
  }
`;

const StyledShopText = styled(TitleM)`
  font-family: 'GT Alpina Condensed';
  font-style: normal;
  font-weight: 300;
  font-size: 24px;
  line-height: 27px;
`;

const StyledLogoBracketLeft = styled(LogoBracketLeft)`
  width: 8px;
  height: 26px;
`;

const StyledLogoBracketRight = styled(LogoBracketRight)`
  width: 8px;
  height: 26px;
`;
