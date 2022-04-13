import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleL, TitleS } from 'components/core/Text/Text';
import MemberListFilter from 'scenes/MemberListPage/MemberListFilter';
import styled from 'styled-components';
import MemberListPageProvider from 'contexts/memberListPage/MemberListPageContext';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import CommunityPageList from './CommunityPageList';
import Markdown from 'components/core/Markdown/Markdown';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { CommunityPageViewFragment$key } from '__generated__/CommunityPageViewFragment.graphql';

type Props = {
  communityRef: CommunityPageViewFragment$key;
};

export default function CommunityPageView({ communityRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityPageViewFragment on Community {
        name
        description
        ...CommunityPageListFragment
      }
    `,
    communityRef
  );
  const { name, description } = community;
  const isMobile = useIsMobileWindowWidth();

  return (
    <MemberListPageProvider>
      <Spacer height={128} />
      <StyledHeader>
        <TitleL>{name}</TitleL>
        {description && (
          <>
            <Spacer height={8} />
            <BaseM>
              <Markdown text={description} />
            </BaseM>
          </>
        )}
      </StyledHeader>
      <Spacer height={isMobile ? 65 : 96} />
      <MemberListFilter />
      <Spacer height={56} />
      <StyledListWrapper>
        <TitleS>Members in this community</TitleS>
        <Spacer height={24} />
        <CommunityPageList communityRef={community} />
      </StyledListWrapper>
      <Spacer height={64} />
    </MemberListPageProvider>
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
