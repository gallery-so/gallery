import { BaseM, TitleL } from 'components/core/Text/Text';
import MemberListFilter from 'components/TokenHolderList/TokenHolderListFilter';
import styled from 'styled-components';
import MemberListPageProvider from 'contexts/memberListPage/MemberListPageContext';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import Markdown from 'components/core/Markdown/Markdown';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { CommunityPageViewFragment$key } from '__generated__/CommunityPageViewFragment.graphql';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TextButton from 'components/core/Button/TextButton';
import breakpoints from 'components/core/breakpoints';
import TokenHolderList from 'components/TokenHolderList/TokenHolderList';
import formatUrl from 'utils/formatUrl';
import { VStack } from 'components/core/Spacer/Stack';

type Props = {
  communityRef: CommunityPageViewFragment$key;
};

export default function CommunityPageView({ communityRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityPageViewFragment on Community {
        name
        description
        owners(first: 10000) @connection(key: "CommunityPageView_owners") {
          edges {
            node {
              ...TokenHolderListFragment
            }
          }
        }
      }
    `,
    communityRef
  );

  const { name, description, owners } = community;
  const isMobile = useIsMobileWindowWidth();

  // whether "Show More" has been clicked or not
  const [showExpandedDescription, setShowExpandedDescription] = useState(false);
  // whether or not the description appears truncated
  const [isLineClampEnabled, setIsLineClampEnabled] = useState(false);

  const descriptionRef = useRef<HTMLParagraphElement>(null);

  const nonNullTokenHolders = useMemo(() => {
    const holders = [];

    for (const owner of owners?.edges ?? []) {
      if (owner?.node) {
        holders.push(owner.node);
      }
    }

    return holders;
  }, [owners?.edges]);

  const handleShowMoreClick = useCallback(() => {
    setShowExpandedDescription((prev) => !prev);
  }, []);

  useEffect(() => {
    // when the descriptionRef is first set, determine if the text exceeds the line clamp threshold of 4 lines by comparing the scrollHeight to the clientHeight
    if (descriptionRef.current !== null) {
      setIsLineClampEnabled(
        descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight
      );
    }
  }, [descriptionRef]);

  const formattedDescription = formatUrl(description || '');

  return (
    <MemberListPageProvider>
      <StyledCommunityPageContainer>
        <StyledHeader>
          <TitleL>{name}</TitleL>
          {description && (
            <StyledDescriptionWrapper gap={8}>
              <StyledBaseM showExpandedDescription={showExpandedDescription} ref={descriptionRef}>
                <Markdown text={formattedDescription} />
              </StyledBaseM>
              {isLineClampEnabled && (
                <TextButton
                  text={showExpandedDescription ? 'Show less' : 'Show More'}
                  onClick={handleShowMoreClick}
                />
              )}
            </StyledDescriptionWrapper>
          )}
        </StyledHeader>

        <StyledMemberListFilterContainer isMobile={isMobile}>
          <MemberListFilter />
        </StyledMemberListFilterContainer>

        <StyledListWrapper>
          <TokenHolderList
            title="Members in this community"
            tokenHoldersRef={nonNullTokenHolders}
          />
        </StyledListWrapper>
      </StyledCommunityPageContainer>
    </MemberListPageProvider>
  );
}

const StyledCommunityPageContainer = styled.div`
  padding: 80px 0 64px;
`;

const StyledBaseM = styled(BaseM)<{ showExpandedDescription: boolean }>`
  -webkit-line-clamp: ${({ showExpandedDescription }) => (showExpandedDescription ? 'initial' : 4)};
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 4;
  display: -webkit-box;

  // allows descriptions with multiple paragraphs to be line clamped properly
  p,
  ol,
  li {
    display: contents;
  }
`;

const StyledDescriptionWrapper = styled(VStack)`
  padding-top: 4px;
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

const StyledMemberListFilterContainer = styled.div<{ isMobile: boolean }>`
  padding: ${({ isMobile }) => (isMobile ? '32px 0' : '80px 0 64px')};
`;
