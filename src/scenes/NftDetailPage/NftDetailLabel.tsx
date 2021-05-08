import { Text } from 'components/core/Text/Text';
import { Nft } from 'types/Nft';
import Spacer from 'components/core/Spacer/Spacer';

import colors from 'components/core/colors';
import breakpoints from 'components/core/breakpoints';
import styled from 'styled-components';

type Props = {
  nft: Nft;
};

function NftDetailLabel({ nft }: Props) {
  return (
    <StyledDetailLabel>
      <StyledNftTitle>{nft.name}</StyledNftTitle>
      <Spacer height={16} />
      <Text>{nft.platformName}</Text>
      <Spacer height={16} />
      <StyledNftDescription color={colors.gray50}>
        {nft.description}
      </StyledNftDescription>
      <Spacer height={32} />
      <Text color={colors.gray50}>Owned By</Text>
      <Text>{nft.ownerName}</Text>
      <Spacer height={16} />
      <Text color={colors.gray50}>Created By</Text>
      <Text>0xad6a7c8bfaf34aeddb036adfe4044d6a5d0a9ce2</Text>
    </StyledDetailLabel>
  );
}

const StyledDetailLabel = styled.div`
  flex-direction: column;
  margin-top: 32px;

  @media only screen and ${breakpoints.tablet} {
    padding-left: 72px;
    margin-top: 0;
  }
`;

const StyledNftTitle = styled(Text)`
  font-size: 20px;
`;

const StyledNftDescription = styled(Text)`
  width: 296px;
  line-height: 20px;

  white-space: pre-line;
`;

export default NftDetailLabel;
