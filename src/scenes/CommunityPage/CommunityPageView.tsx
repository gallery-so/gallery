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
import isFeatureEnabled, { FeatureFlag } from 'utils/graphql/isFeatureEnabled';
import { CommunityPageViewQueryFragment$key } from '__generated__/CommunityPageViewQueryFragment.graphql';

type Props = {
  communityRef: CommunityPageViewFragment$key;
  queryRef: CommunityPageViewQueryFragment$key;
};

export default function CommunityPageView({ communityRef, queryRef }: Props) {
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
        ...CommunityHolderGridFragment
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityPageViewQueryFragment on Query {
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const { name, description, contractAddress } = community;
  const isMobile = useIsMobileWindowWidth();

  const [layout, setLayout] = useState<DisplayLayout>(DisplayLayout.GRID);
  const isGrid = useMemo(() => layout === DisplayLayout.GRID, [layout]);

  const isArtGobblersEnabled = isFeatureEnabled(FeatureFlag.ART_GOBBLERS, query);

  // TODO: Replace with the art gobbler contract address
  const isArtGobbler = useMemo(
    () =>
      contractAddress?.address === '0x23581767a106ae21c074b2276d25e5c3e136a68b' &&
      isArtGobblersEnabled,
    [contractAddress, isArtGobblersEnabled]
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
        <HStack>
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

          {isArtGobbler && (
            <StyledLayoutToggleButtonContainer>
              <LayoutToggleButton layout={layout} setLayout={setLayout} />
            </StyledLayoutToggleButtonContainer>
          )}
        </HStack>

        {isGrid && isArtGobbler ? (
          <StyledGridViewContainer gap={24}>
            <StyledBreakLine />
            <StyledListWrapper>
              <CommunityHolderGrid communityRef={community} />
            </StyledListWrapper>
          </StyledGridViewContainer>
        ) : (
          <>
            <StyledMemberListFilterContainer isMobile={isMobile}>
              <MemberListFilter />
            </StyledMemberListFilterContainer>

            <StyledListWrapper>
              <TokenHolderList
                title="Members in this community"
                tokenHoldersRef={community.owners}
              />
            </StyledListWrapper>
          </>
        )}
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

const StyledGridViewContainer = styled(VStack)`
  padding-top: 24px;
`;

const StyledBreakLine = styled.hr`
  width: 100%;
  height: 1px;
  background-color: ${colors.faint};
  border: none;
`;

const StyledMemberListFilterContainer = styled.div<{ isMobile: boolean }>`
  padding: ${({ isMobile }) => (isMobile ? '32px 0' : '80px 0 64px')};
`;
