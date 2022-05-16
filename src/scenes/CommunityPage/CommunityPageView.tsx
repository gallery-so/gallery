import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleL } from 'components/core/Text/Text';
import MemberListFilter from 'components/TokenHolderList/TokenHolderListFilter';
import styled from 'styled-components';
import MemberListPageProvider from 'contexts/memberListPage/MemberListPageContext';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import Markdown from 'components/core/Markdown/Markdown';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { CommunityPageViewFragment$key } from '__generated__/CommunityPageViewFragment.graphql';
import { useCallback, useEffect, useRef, useState } from 'react';
import TextButton from 'components/core/Button/TextButton';
import breakpoints from 'components/core/breakpoints';
import TokenHolderList from 'components/TokenHolderList/TokenHolderList';

type Props = {
  communityRef: CommunityPageViewFragment$key;
};

export default function CommunityPageView({ communityRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityPageViewFragment on Community {
        name
        description
        owners {
          user @required(action: THROW) {
            dbid
            username @required(action: THROW)
          }
          ...TokenHolderListItemFragment
        }
      }
    `,
    communityRef
  );
  const { name, description } = community;
  const isMobile = useIsMobileWindowWidth();

  // whether "Show More" has been clicked or not
  const [showExpandedDescription, setShowExpandedDescription] = useState(false);
  // whether or not the description appears truncated
  const [isLineClampEnabled, setIsLineClampEnabled] = useState(false);

  const handleShowMoreClick = useCallback(() => {
    setShowExpandedDescription((prev) => !prev);
  }, []);

  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // when the descriptionRef is first set, determine if the text exceeds the line clamp threshold of 4 lines by comparing the scrollHeight to the clientHeight
    if (descriptionRef.current !== null) {
      setIsLineClampEnabled(
        descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight
      );
    }
  }, [descriptionRef]);

  return (
    <MemberListPageProvider>
      <Spacer height={128} />
      <StyledHeader>
        <TitleL>{name}</TitleL>
        {description && (
          <StyledDescriptionWrapper>
            <Spacer height={8} />
            <StyledBaseM showExpandedDescription={showExpandedDescription} ref={descriptionRef}>
              <Markdown text={description} />
            </StyledBaseM>
            <Spacer height={8} />
            {isLineClampEnabled && (
              <TextButton
                text={showExpandedDescription ? 'Show less' : 'Show More'}
                onClick={handleShowMoreClick}
              />
            )}
          </StyledDescriptionWrapper>
        )}
      </StyledHeader>
      <Spacer height={isMobile ? 65 : 96} />
      <MemberListFilter />
      <Spacer height={56} />
      <StyledListWrapper>
        <TokenHolderList title="Members in this community" tokenHoldersRef={community.owners} />
      </StyledListWrapper>
      <Spacer height={64} />
    </MemberListPageProvider>
  );
}

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

const StyledDescriptionWrapper = styled.div`
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
