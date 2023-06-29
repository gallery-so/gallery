import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import CommunityHolderList from '~/components/Community/CommunityHolderList';
import CommunityHolderGrid from '~/components/CommunityHolderGrid/CommunityHolderGrid';
import breakpoints from '~/components/core/breakpoints';
import TextButton from '~/components/core/Button/TextButton';
import { DisplayLayout } from '~/components/core/enums';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleL, TitleXS } from '~/components/core/Text/Text';
import MemberListFilter from '~/components/TokenHolderList/TokenHolderListFilter';
import { GRID_ENABLED_COMMUNITY_ADDRESSES } from '~/constants/community';
import MemberListPageProvider from '~/contexts/memberListPage/MemberListPageContext';
import { CommunityPageViewFragment$key } from '~/generated/CommunityPageViewFragment.graphql';
import { CommunityPageViewQueryFragment$key } from '~/generated/CommunityPageViewQueryFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import colors from '~/shared/theme/colors';
import { getExternalAddressLink, truncateAddress } from '~/shared/utils/wallet';
import formatUrl from '~/utils/formatUrl';
import { DISABLED_CONTRACTS } from '~/utils/getCommunityUrlForToken';

import CommunityPageDisabled from './CommunityPageDisabled';
import LayoutToggleButton from './LayoutToggleButton';

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
        badgeURL
        contractAddress {
          address
          ...walletGetExternalAddressLinkFragment
        }

        ...CommunityHolderGridFragment
        ...CommunityHolderListFragment
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityPageViewQueryFragment on Query {
        ...CommunityHolderListQueryFragment
      }
    `,
    queryRef
  );

  const { name, description, contractAddress, badgeURL } = community;
  const isMobile = useIsMobileWindowWidth();

  if (!contractAddress) {
    throw new Error('CommunityPageView: contractAddress not found on community');
  }

  const isGridEnabled = useMemo(
    () => GRID_ENABLED_COMMUNITY_ADDRESSES.includes(contractAddress.address || ''),
    [contractAddress.address]
  );
  const [layout, setLayout] = useState<DisplayLayout>(DisplayLayout.GRID);
  const showGrid = useMemo(
    () => isGridEnabled && layout === DisplayLayout.GRID,
    [isGridEnabled, layout]
  );

  const isCommunityPageDisabled = DISABLED_CONTRACTS.includes(contractAddress.address ?? '');

  // whether "Show More" has been clicked or not
  const [showExpandedDescription, setShowExpandedDescription] = useState(false);
  // whether or not the description appears truncated
  const [isLineClampEnabled, setIsLineClampEnabled] = useState(false);

  const descriptionRef = useRef<HTMLParagraphElement>(null);

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

  const externalAddressLink = getExternalAddressLink(contractAddress);

  return (
    <MemberListPageProvider>
      <StyledCommunityPageContainer>
        <HStack>
          <StyledHeader gap={24}>
            <VStack>
              <HStack gap={12} align="center">
                <TitleL>{name}</TitleL>
                {badgeURL && <StyledBadge src={badgeURL} />}
              </HStack>

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
            </VStack>
            {externalAddressLink && (
              <StyledAddressContainer>
                <TitleXS>Contract Address</TitleXS>
                <InteractiveLink href={externalAddressLink}>
                  {truncateAddress(contractAddress?.address ?? '')}
                </InteractiveLink>
              </StyledAddressContainer>
            )}
          </StyledHeader>

          {isGridEnabled && (
            <StyledLayoutToggleButtonContainer>
              <LayoutToggleButton layout={layout} setLayout={setLayout} />
            </StyledLayoutToggleButtonContainer>
          )}
        </HStack>

        {isCommunityPageDisabled ? (
          <CommunityPageDisabled name={name ?? ''} />
        ) : showGrid ? (
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
              <CommunityHolderList communityRef={community} queryRef={query} />
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
  -webkit-line-clamp: ${({ showExpandedDescription }) => (showExpandedDescription ? 'initial' : 5)};
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 5;
  display: -webkit-box;
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

const StyledHeader = styled(VStack)`
  width: 100%;
`;

const StyledAddressContainer = styled(VStack)`
  width: fit-content;
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

const StyledBadge = styled.img`
  max-height: 24px;
  max-width: 24px;
  width: 100%;
`;
