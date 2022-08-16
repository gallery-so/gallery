import styled from 'styled-components';
import breakpoints from 'components/core/breakpoints';
import React from 'react';
import { TitleM } from 'components/core/Text/Text';
import ItemPreview from './ItemPreview';

const items = [
  {
    label: 'Shirt',
    image: '/merch/shirt',
    title: '(Object 001)',
    description:
      'Black short sleeve cotton t-shirt with puff-print design on left chest and both puff-print and screen-print design on full back.',
    price: '0.05',
    tokenId: 0,
  },
  {
    label: 'Hat',
    image: '/merch/hat',
    title: '(Object 002)',
    description: 'Gallery Dad Hat. 100% cotton. Made in China.',
    price: '0.06',
    tokenId: 1,
  },
  {
    label: 'Card',
    image: '/merch/card',
    title: '(Object 003)',
    description: 'Gallery Membership card. Metal.',
    price: '0.08',
    tokenId: 2,
  },
];

export default function MerchStorePage() {
  return (
    <StyledPage>
      <StyledShopText>(OBJECTS)</StyledShopText>
      <StyledItemsContainer>
        {items.map((item) => (
          <ItemPreview {...item} key={item.label} />
        ))}
      </StyledItemsContainer>
    </StyledPage>
  );
}

const StyledPage = styled.div`
  min-height: 90vh;
  padding: 20px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
`;

const StyledShopText = styled(TitleM)`
  top: 16px;
  position: absolute;
  font-family: 'GT Alpina Condensed';
  font-style: normal;
  font-weight: 300;
  font-size: 24px;
  line-height: 27px;
`;

const StyledItemsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-top: 120px; /* FIXME: Exact ? */
  justify-content: center;
  place-items: center;

  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
    padding-top: 0;
  }
`;
