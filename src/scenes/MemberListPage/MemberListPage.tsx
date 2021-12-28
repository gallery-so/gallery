import Page from 'components/core/Page/Page';
import useMemberList from 'hooks/api/users/useMemberList';
import styled from 'styled-components';
import { Display } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import MemberListTier from './MemberListTier';

function MemberListPage() {
  const memberList = useMemberList();
  console.log('memberList', memberList);

  return (
    <StyledPage centered>
      <StyledBanner>
        <Display>
          <i>Thank you,</i> for being a member of Gallery.
        </Display>
      </StyledBanner>
      <Spacer height={96} />
      <StyledTierWrapper>
        {memberList.map((tier) => (
          <MemberListTier key={tier.id} tier={tier} />
        ))}
      </StyledTierWrapper>
    </StyledPage>
  );
}

const StyledPage = styled(Page)`
  margin-left: ${pageGutter.mobile}px;
  margin-right: ${pageGutter.mobile}px;

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
  width: 500px;
  margin-right: auto;
`;

const StyledTierWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export default MemberListPage;
