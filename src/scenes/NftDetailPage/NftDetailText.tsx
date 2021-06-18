import { Heading, BodyRegular } from 'components/core/Text/Text';
import { Nft } from 'types/Nft';
import Spacer from 'components/core/Spacer/Spacer';

import colors from 'components/core/colors';
import breakpoints from 'components/core/breakpoints';
import styled from 'styled-components';

type Props = {
  nft: Nft;
};

function NftDetailText({ nft }: Props) {
  return (
    <StyledDetailLabel>
      <Heading>{nft.name}</Heading>
      <Spacer height={16} />
      <BodyRegular>{nft.platformName}</BodyRegular>
      <Spacer height={16} />
      <StyledNftDescription color={colors.gray50}>
        {nft.description}
      </StyledNftDescription>
      <Spacer height={32} />
      <BodyRegular color={colors.gray50}>Owned By</BodyRegular>
      <BodyRegular>{nft.ownerName}</BodyRegular>
      <Spacer height={16} />
      <BodyRegular color={colors.gray50}>Created By</BodyRegular>
      <BodyRegular>0xad6a7c8bfaf34aeddb036adfe4044d6a5d0a9ce2</BodyRegular>
    </StyledDetailLabel>
  );
}

const StyledDetailLabel = styled.div`
  flex-direction: column;
  margin-top: 32px;
  word-wrap: break-word;

  @media only screen and ${breakpoints.tablet} {
    padding-left: 72px;
    margin-top: 0;
  }
`;

const StyledNftDescription = styled(BodyRegular)`
  width: 296px;

  white-space: pre-line;
`;

export default NftDetailText;
