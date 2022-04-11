import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleL, TitleS } from 'components/core/Text/Text';
import MemberListFilter from 'scenes/MemberListPage/MemberListFilter';
import styled from 'styled-components';
import { Community } from 'types/Community';
import MemberListPageProvider from 'contexts/memberListPage/MemberListPageContext';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import CommunityPageList from './CommunityPageList';
import Markdown from 'components/core/Markdown/Markdown';

type Props = {
  community: Community;
};

export default function CommunityPageView({ community }: Props) {
  const isMobile = useIsMobileWindowWidth();

  return (
    <>
      <MemberListPageProvider>
        <Spacer height={128} />
        <StyledHeader>
          <TitleL>{community.name}</TitleL>
          <Spacer height={8} />
          <BaseM>
            <Markdown text={community.description} />
          </BaseM>
        </StyledHeader>
        <Spacer height={isMobile ? 65 : 96} />
        <MemberListFilter />
        <Spacer height={56} />
        <StyledListWrapper>
          <TitleS>Members in this community</TitleS>
          <Spacer height={24} />
          <CommunityPageList owners={community.owners} />
        </StyledListWrapper>
        <Spacer height={64} />
      </MemberListPageProvider>
    </>
  );
}

const StyledListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledHeader = styled.div`
  width: 100%;
`;
