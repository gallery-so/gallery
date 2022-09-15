import { useMemo } from 'react';
import styled from 'styled-components';
import { TitleS } from 'components/core/Text/Text';
import TokenHolderListItem from './TokenHolderListItem';
import { Directions } from 'src/components/core/enums';
import { removeNullValues } from 'utils/removeNullValues';
import { useMemberListPageState } from 'contexts/memberListPage/MemberListPageContext';
import { MemberListTierFragment$data } from '__generated__/MemberListTierFragment.graphql';
import { CommunityPageViewFragment$data } from '__generated__/CommunityPageViewFragment.graphql';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import { Spacer, VStack } from 'components/core/Spacer/Stack';

// Get which side of the tokenHolder name to show the preview on
// 1st and 2nd column should be right, 3rd and 4th column should be left
function getPreviewDirection(index: number) {
  return index % 4 < 2 ? Directions.RIGHT : Directions.LEFT;
}

type Props = {
  title: string;
  tokenHoldersRef: MemberListTierFragment$data['owners'] | CommunityPageViewFragment$data['owners'];
};

function TokenHolderList({ title, tokenHoldersRef }: Props) {
  const { fadeUsernames, searchQuery } = useMemberListPageState();

  const sortedTokenHolders = useMemo(() => {
    const nonNullTokenHolders = removeNullValues(tokenHoldersRef ?? []);

    nonNullTokenHolders.sort((a, b) => {
      const usernameA = a.user.username.toLowerCase();
      const usernameB = b.user.username.toLowerCase();

      return (
        // TODO(Terence): What is going on here
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (/^[0-9]/.test(usernameA) as any) - (/^[0-9]/.test(usernameB) as any) ||
        usernameA.localeCompare(usernameB, undefined, { numeric: true })
      );
    });
    return nonNullTokenHolders;
  }, [tokenHoldersRef]);

  const filteredTokenHolders = useMemo(() => {
    if (!searchQuery) {
      return sortedTokenHolders;
    }

    if (searchQuery === '#') {
      return sortedTokenHolders.filter(
        (tokenHolder) => !/^[A-Za-z]/.test(tokenHolder.user.username)
      );
    }

    return sortedTokenHolders.filter((tokenHolder) =>
      tokenHolder.user.username.toLowerCase().startsWith(searchQuery.toLocaleLowerCase())
    );
  }, [searchQuery, sortedTokenHolders]);

  const isMobile = useIsMobileWindowWidth();

  return (
    <VStack gap={isMobile ? 24 : 16}>
      <TitleS>{title}</TitleS>
      <VStack gap={56}>
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
        <Spacer />
      </VStack>
    </VStack>
  );
}

const StyledTokenHoldersWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export default TokenHolderList;
