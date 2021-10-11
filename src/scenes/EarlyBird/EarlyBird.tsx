
import colors from 'components/core/colors';
import Page from 'components/core/Page/Page';
import Spacer from 'components/core/Spacer/Spacer';
import { BodyRegular, Heading } from 'components/core/Text/Text';
import ShimmerProvider from 'contexts/shimmer/ShimmerContext';
import styled from 'styled-components';

const description = `Become a member of Gallery.\n
Holding this grants you the ability to you to sign up as a new user and access the Gallery beta. You must be holding a membership card at all times in order to continue updating your gallery.\n
While the Silver Member Card supply is capped at 500, we will be releasing other tiers of Member Cards for future users.\n
Note that Gallery will be eventually open to all. We are currently restricting access while in beta.\n
Therefore the primary tangible benefit of acquiring this NFT is to gain early access to Gallery.\n
Limit 1 per wallet address.`;

function EarlyBird() {
  return (<Page centered>
    <StyledContent>
      <StyledMedia>
        {/* <ShimmerProvider> */}
        <StyledVideo
          src="./src/assets/007_Member_v2.mov" autoPlay/>
        {/* </ShimmerProvider> */}
      </StyledMedia>
      EarlyBird
      <StyledDetailText>
        <Heading>Silver Member Card</Heading>
        <Spacer height={16} />
        <BodyRegular>Gallery</BodyRegular>
        <Spacer height={16} />
        <StyledNftDescription color={colors.gray50}>
          {description}
        </StyledNftDescription>
        <Spacer height={32} />
        <BodyRegular color={colors.gray50}>Price</BodyRegular>
        <BodyRegular>0.2 ETH</BodyRegular>
        <Spacer height={16} />
        <BodyRegular color={colors.gray50}>Available</BodyRegular>
        <BodyRegular>500/500</BodyRegular>
        <Spacer height={32} />
      </StyledDetailText>
    </StyledContent>
  </Page>);
}

const StyledMedia = styled.div``;

const StyledContent = styled.div`
  display: flex;
`;

const StyledDetailText = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 296px;
  word-wrap: break-word;
`;

const StyledNftDescription = styled(BodyRegular)`
  white-space: pre-line;
`;

const StyledVideo = styled.video`
`;

export default EarlyBird;
