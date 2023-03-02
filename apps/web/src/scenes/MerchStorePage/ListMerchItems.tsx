import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { ListMerchItemsFragment$key } from '~/generated/ListMerchItemsFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import ItemPreview from './ItemPreview';
import { merchItems } from './MerchStorePage';

type Props = {
  queryRef: ListMerchItemsFragment$key;
};

export default function ListMerchItems({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment ListMerchItemsFragment on MerchTokensPayload {
        tokens {
          objectType
        }
      }
    `,
    queryRef
  );

  const { tokens } = query;
  const nonNullTokens = useMemo(() => removeNullValues(tokens), [tokens]);

  const merchItemsWithQuantity = useMemo(() => {
    const merchItemsWithQuantity = merchItems.map((item) => {
      const matchingToken = nonNullTokens.filter((token) => token.objectType === item.type);
      return {
        ...item,
        quantity: matchingToken.length,
      };
    });
    return merchItemsWithQuantity;
  }, [nonNullTokens]);

  console.log('merchItemsWithQuantity', merchItemsWithQuantity);

  return (
    <StyledItemsContainer>
      {merchItemsWithQuantity.map((item) => (
        <ItemPreview {...item} key={item.label} />
      ))}
    </StyledItemsContainer>
  );
}

const StyledItemsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  place-items: center;

  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
    padding: 0;
  }
`;
