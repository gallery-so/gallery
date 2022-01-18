import Page from 'components/core/Page/Page';
import useMemberList from 'hooks/api/users/useMemberList';
import styled from 'styled-components';
import { Display } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import breakpoints, { pageGutter, size } from 'components/core/breakpoints';
import MemberListTier from './MemberListTier';
import MemberListFilter from './MemberListFilter';
import { useMemo } from 'react';
import { useBreakpoint } from 'hooks/useWindowSize';
import MemberListPageProvider from 'contexts/memberListPage/MemberListPageContext';

function MemberListPage() {
  const memberList = useMemberList();
  const breakpoint = useBreakpoint();
  const isMobileScreenSize = useMemo(() => breakpoint === size.mobile, [breakpoint]);

  return (
    <StyledPage centered>
      <MemberListPageProvider>
        <Spacer height={128} />
        <StyledBanner>
          <StyledBannerText>
            <i>Thank you,</i> for being a member of Gallery.
          </StyledBannerText>
        </StyledBanner>
        <Spacer height={isMobileScreenSize ? 65 : 96} />
        <MemberListFilter />
        <Spacer height={56} />
        <StyledTierWrapper>
          {memberList.map((tier) => (
            <MemberListTier key={tier.id} tier={tier} />
          ))}
        </StyledTierWrapper>
      </MemberListPageProvider>
    </StyledPage>
  );
}

const StyledPage = styled(Page)`
  margin-left: ${pageGutter.mobile}px;
  margin-right: ${pageGutter.mobile}px;
  justify-content: flex-start;
  max-width: 100vw;

  @media only screen and ${breakpoints.tablet} {
    margin-left: ${pageGutter.tablet}px;
    margin-right: ${pageGutter.tablet}px;
  }

  @media only screen and ${breakpoints.desktop} {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 32px;
  }
`;

const StyledBanner = styled.div`
  max-width: 500px;
  margin-right: auto;
`;

const StyledBannerText = styled(Display)`
  font-size: 40px;
  line-height: 48px;
  white-space: pre-wrap;
  @media only screen and ${breakpoints.tablet} {
    font-size: 48px;
    line-height: 56px;
  }
`;

const StyledTierWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export default MemberListPage;
