import { RouteComponentProps } from '@reach/router';
import styled from 'styled-components';
import { Text } from 'components/core/Text/Text';
import { Nft } from 'types/Nft';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import breakpoints from 'components/core/breakpoints';

function NftDetailPage(_: RouteComponentProps) {
  // get nft
  // render it
  const nft: Nft = {
    id: '1',
    name: 'The Fold Ep2',
    artist: 'Superrare',
    image_url: 'string',
    image_preview_url: 'string',
  };

  const description =
    'A psychedelic piece inspired by the allure of aposematic coloration\n found in plants and the natural world\n\n' +
    '~~~~~\n\n' +
    'All details and elements in this piece are purely photographic, which have been carefully cut out and arranged into a floral composition, then digitally animated and colour graded.\n\n' +
    '~~~~~\n\n' +
    'The creative process is a very meditative experience, which is transmitted from the final result to the viewer as a hypnotic loop.';
  return (
    <StyledNftDetailPage>
      <StyledContentContainer>
        <StyledImageContainer>
          <StyledImage src="https://ipfs.pixura.io/ipfs/QmPN9kEevrvSjjFhScVEHP6t8QC2dRY2PGFmcE8Yz6aUvv/Dom-Qwek_Broken-1_2021.jpg"></StyledImage>
        </StyledImageContainer>
        <StyledLabelContainer>
          <StyledNftTitle>{nft.name}</StyledNftTitle>
          <Spacer height={16} />
          <Text>{nft.artist}</Text>
          <Spacer height={16} />
          <StyledNftDescription color={colors.gray50}>
            {description}
          </StyledNftDescription>
          <Spacer height={32} />
          <Text color={colors.gray50}>Owned By</Text>
          <Text>Fabric Softener</Text>
          <Spacer height={16} />
          <Text color={colors.gray50}>Created By</Text>
          <Text>0xad6a7c8bfaf34aeddb036adfe4044d6a5d0a9ce2</Text>
        </StyledLabelContainer>
      </StyledContentContainer>
    </StyledNftDetailPage>
  );
}
const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  margin: 64px auto 0;

  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
  }
`;
const StyledNftDetailPage = styled.div`
  display: flex;
`;

const StyledImageContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledImage = styled.img`
  width: 100%;

  @media only screen and ${breakpoints.tablet} {
    width: 600px;
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

const StyledLabelContainer = styled.div`
  flex-direction: column;
  margin-top: 32px;

  @media only screen and ${breakpoints.tablet} {
    padding-left: 72px;
    margin-top: 0;
  }
`;

export default NftDetailPage;
