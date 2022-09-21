import styled from 'styled-components';
import { TitleL } from 'components/core/Text/Text';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import MemberListTier from './MemberListTier';
import TokenHolderListFilter from 'components/TokenHolderList/TokenHolderListFilter';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import MemberListPageProvider from 'contexts/memberListPage/MemberListPageContext';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { MemberListPageFragment$key } from '__generated__/MemberListPageFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import { VStack } from 'components/core/Spacer/Stack';

type Props = {
  queryRef: MemberListPageFragment$key;
};

function MemberListPage({ queryRef }: Props) {
  const { membershipTiers } = useFragment(
    graphql`
      fragment MemberListPageFragment on Query {
        membershipTiers @required(action: THROW) {
          id
          ...MemberListTierFragment
        }
      }
    `,
    queryRef
  );

  const isMobile = useIsMobileWindowWidth();

  return (
    <StyledPage>
      <MemberListPageProvider>
        <StyledBanner>
          <StyledBannerText>
            <i>Thank you,</i> for being a patron of Gallery.
          </StyledBannerText>
        </StyledBanner>
        <StyledTokenHolderListFilterContainer>
          <TokenHolderListFilter />
        </StyledTokenHolderListFilterContainer>
        <StyledTierWrapper>
          {removeNullValues(membershipTiers).map((tier) => (
            <MemberListTier key={tier.id} tierRef={tier} />
          ))}
        </StyledTierWrapper>
      </MemberListPageProvider>
    </StyledPage>
  );
}

const StyledPage = styled(VStack)`
  min-height: 100vh;

  margin-left: ${pageGutter.mobile}px;
  margin-right: ${pageGutter.mobile}px;
  justify-content: flex-start;
  max-width: 100vw;

  padding-top: 208px;

  @media only screen and ${breakpoints.tablet} {
    margin-left: ${pageGutter.tablet}px;
    margin-right: ${pageGutter.tablet}px;
  }

  @media only screen and ${breakpoints.desktop} {
    max-width: 1200px;
    margin: 0 auto;
    padding: 208px 32px 0;
  }
`;

const StyledBanner = styled.div`
  max-width: 500px;
  margin-right: auto;
`;

const StyledBannerText = styled(TitleL)`
  font-size: 40px;
  line-height: 48px;
  white-space: pre-wrap;
  @media only screen and ${breakpoints.tablet} {
    font-size: 48px;
    line-height: 56px;
  }
`;

const StyledTokenHolderListFilterContainer = styled.div`
  padding: 32px 0 32px 0;

  @media only screen and ${breakpoints.tablet} {
    padding: 80px 0 64px 0;
  }
`;

const StyledTierWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export default MemberListPage;
