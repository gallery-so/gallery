import { BaseM, TitleDiatypeL } from 'components/core/Text/Text';
import { VStack } from 'components/core/Spacer/Stack';
import { ReactNode, useMemo } from 'react';
import styled from 'styled-components';

type Reason = 'no-search-results' | 'no-nfts';

type Props = {
  chain: string;
  reason: Reason;
};

export function EmptySidebar({ chain, reason }: Props) {
  // Typing this explicitly in case we add a new Reason above
  // and then forget to handle that new case here
  const subtext: ReactNode = useMemo(() => {
    if (reason === 'no-nfts') {
      return <BaseM>You do not have any {chain} pieces</BaseM>;
    } else if (reason === 'no-search-results') {
      return <BaseM>No pieces matching your search query</BaseM>;
    }
  }, [chain, reason]);

  return (
    <StyledVStack grow align="center" justify="center">
      <TitleDiatypeL>It&apos;s looking empty</TitleDiatypeL>
      {subtext}
    </StyledVStack>
  );
}

const StyledVStack = styled(VStack)`
  text-align: center;
`;
