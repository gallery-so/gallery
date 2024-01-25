import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { Directions } from '~/components/core/enums';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleS } from '~/components/core/Text/Text';
import { useMemberListPageState } from '~/contexts/memberListPage/MemberListPageContext';
import { TokenHolderListFragment$key } from '~/generated/TokenHolderListFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import breakpoints from '../core/breakpoints';
import TokenHolderListItem from './TokenHolderListItem';

// Get which side of the tokenHolder name to show the preview on
// 1st and 2nd column should be right, 3rd and 4th column should be left
function getPreviewDirection(index: number) {
  return index % 4 < 2 ? Directions.RIGHT : Directions.LEFT;
}

type Props = {
  title?: string;
  tokenHoldersRef: TokenHolderListFragment$key;
};

function TokenHolderList({ title, tokenHoldersRef }: Props) {
  const tokenHolders = useFragment(
    graphql`
      fragment TokenHolderListFragment on TokenHolder @relay(plural: true) {
        user @required(action: THROW) {
          dbid
          username @required(action: THROW)
        }

        ...TokenHolderListItemFragment
      }
    `,
    tokenHoldersRef
  );

  const { fadeUsernames, searchQuery } = useMemberListPageState();

  const nonNullTokenHolders = useMemo(() => removeNullValues(tokenHolders ?? []), [tokenHolders]);

  const filteredTokenHolders = useMemo(() => {
    if (!searchQuery) {
      return nonNullTokenHolders;
    }

    if (searchQuery === '#') {
      return nonNullTokenHolders.filter(
        (tokenHolder) => !/^[A-Za-z]/.test(tokenHolder.user.username)
      );
    }

    return nonNullTokenHolders.filter((tokenHolder) =>
      tokenHolder.user.username.toLowerCase().startsWith(searchQuery.toLocaleLowerCase())
    );
  }, [searchQuery, nonNullTokenHolders]);

  const isMobile = useIsMobileWindowWidth();

  return (
    <VStack gap={isMobile ? 24 : 16}>
      {title && <TitleS>{title}</TitleS>}
      <StyledTokenHoldersWrapper>
        {filteredTokenHolders.map((tokenHolder, index) => (
          <TokenHolderListItem
            key={tokenHolder.user.dbid}
            tokenHolderRef={tokenHolder}
            direction={getPreviewDirection(index)}
            fadeUsernames={fadeUsernames}
          />
        ))}
      </StyledTokenHoldersWrapper>
    </VStack>
  );
}

const StyledTokenHoldersWrapper = styled(HStack)`
  flex-wrap: wrap;
  padding-bottom: 56px;
  row-gap: 18px;
  max-width: 80%;

  @media only screen and ${breakpoints.mobile} {
    max-width: 100%;
  }
`;

export default TokenHolderList;
