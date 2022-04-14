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
import { useCallback, useMemo, useState } from 'react';
import TextButton from 'components/core/Button/TextButton';
import breakpoints from 'components/core/breakpoints';

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

  const truncatedDescription = useMemo(() => {
    if (!description) {
      return '';
    }
    return description.length > 330 ? `${description.slice(0, 327).trim()}...` : description;
  }, [description]);

  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleShowMoreClick = useCallback(() => {
    setShowFullDescription((prev) => !prev);
  }, []);

  return (
    <MemberListPageProvider>
      <Spacer height={128} />
      <StyledHeader>
        <TitleL>{name}</TitleL>
        {description && (
          <StyledDescription>
            <Spacer height={8} />
            <BaseM>
              <Markdown text={showFullDescription ? description : truncatedDescription} />
            </BaseM>
            <Spacer height={8} />
            <TextButton
              text={showFullDescription ? 'Show less' : 'Show More'}
              onClick={handleShowMoreClick}
            />
          </StyledDescription>
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

const StyledDescription = styled.div`
  @media only screen and ${breakpoints.tablet} {
    width: 50%;
  }
`;

const StyledListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledHeader = styled.div`
  width: 100%;
`;
