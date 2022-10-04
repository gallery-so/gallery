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
import { HStack, VStack } from 'components/core/Spacer/Stack';
import colors from 'components/core/colors';
import LayoutToggleButton from './LayoutToggleButton';
import { DisplayLayout } from 'components/core/enums';
import CommunityHolderGrid from 'components/CommunityHolderGrid/CommunityHolderGrid';

type Props = {
  communityRef: CommunityPageViewFragment$key;
};

export default function CommunityPageView({ communityRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityPageViewFragment on Community {
        name
        description
        contractAddress {
          address
        }
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
  const { name, description, contractAddress } = community;
  const isMobile = useIsMobileWindowWidth();

  const [layout, setLayout] = useState<DisplayLayout>(DisplayLayout.LIST);
  const isGrid = useMemo(() => layout === DisplayLayout.LIST, [layout]);

  // TODO: Replace with the art gobbler contract address
  const isArtGobbler = useMemo(
    () => contractAddress?.address === '0x23581767a106ae21c074b2276d25e5c3e136a68b',
    [contractAddress]
  );

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

  const formattedDescription = formatUrl(description || '');

  return (
    <MemberListPageProvider>
      <StyledCommunityPageContainer>
        <VStack gap={24}>
          <HStack>
            <StyledHeader>
              <TitleL>{name}</TitleL>
              {description && (
                <StyledDescriptionWrapper gap={8}>
                  <StyledBaseM
                    showExpandedDescription={showExpandedDescription}
                    ref={descriptionRef}
                  >
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
            <StyledLayoutToggleButtonContainer>
              <LayoutToggleButton layout={layout} setLayout={setLayout} />
            </StyledLayoutToggleButtonContainer>
          </HStack>

          <StyledBreakLine />

          {!isGrid && (
            <StyledMemberListFilterContainer isMobile={isMobile}>
              <MemberListFilter />
            </StyledMemberListFilterContainer>
          )}

          {isGrid ? (
            <StyledListWrapper>
              <CommunityHolderGrid />
            </StyledListWrapper>
          ) : (
            <StyledListWrapper>
              <TokenHolderList
                title="Members in this community"
                tokenHoldersRef={community.owners}
              />
            </StyledListWrapper>
          )}
        </VStack>
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

const StyledLayoutToggleButtonContainer = styled.div`
  align-self: flex-end;
`;

const StyledBreakLine = styled.hr`
  width: 100%;
  height: 1px;
  background-color: ${colors.faint};
  border: none;
`;

const StyledMemberListFilterContainer = styled.div<{ isMobile: boolean }>`
  padding: ${({ isMobile }) => (isMobile ? '0 0 32px 0' : '0 0 48px 0')};
`;
