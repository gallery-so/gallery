import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import CopyToClipboard from '~/components/CopyToClipboard/CopyToClipboard';
import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import TextButton from '~/components/core/Button/TextButton';
import IconContainer from '~/components/core/IconContainer';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeL, TitleL } from '~/components/core/Text/Text';
import { PostComposerModalWithSelector } from '~/components/Posts/PostComposerModal';
import CommunityProfilePicture from '~/components/ProfilePicture/CommunityProfilePicture';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { CommunityPageViewHeaderFragment$key } from '~/generated/CommunityPageViewHeaderFragment.graphql';
import { CommunityPageViewHeaderQueryFragment$key } from '~/generated/CommunityPageViewHeaderQueryFragment.graphql';
import { PostComposerModalWithSelectorFragment$key } from '~/generated/PostComposerModalWithSelectorFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import GlobeIcon from '~/icons/GlobeIcon';
import { PlusSquareIcon } from '~/icons/PlusSquareIcon';
import ShareIcon from '~/icons/ShareIcon';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';
import { getExternalAddressLink } from '~/shared/utils/wallet';
import formatUrl from '~/utils/formatUrl';
import { getBaseUrl } from '~/utils/getBaseUrl';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

import CommunityPageMetadata from './CommunityPageMetadata';

type Props = {
  communityRef: CommunityPageViewHeaderFragment$key;
  queryRef: CommunityPageViewHeaderQueryFragment$key;
};

export default function CommunityPageViewHeader({ communityRef, queryRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityPageViewHeaderFragment on Community {
        name
        description
        badgeURL
        contractAddress {
          address
          ...walletGetExternalAddressLinkFragment
        }
        ...CommunityPageMetadataFragment
        ...CommunityProfilePictureFragment
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityPageViewHeaderQueryFragment on Query {
        viewer {
          __typename
          ... on Viewer {
            user {
              tokens {
                ...PostComposerModalWithSelectorFragment
              }
            }
          }
        }
        ...PostComposerModalWithSelectorQueryFragment
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const isMobile = useIsMobileWindowWidth();
  const isKoalaEnabled = isFeatureEnabled(FeatureFlag.KOALA, query);

  const { name, description, contractAddress, badgeURL } = community;

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

  const externalAddressLink = useMemo(() => {
    if (contractAddress) {
      return getExternalAddressLink(contractAddress);
    }
    return null;
  }, [contractAddress]);

  const track = useTrack();
  const { showModal } = useModalActions();

  const tokens = useMemo<PostComposerModalWithSelectorFragment$key>(() => {
    if (query?.viewer?.__typename !== 'Viewer') {
      return [];
    }
    return removeNullValues(query?.viewer?.user?.tokens) ?? [];
  }, [query?.viewer]);

  const handleCreatePostClick = useCallback(() => {
    showModal({
      content: (
        <PostComposerModalWithSelector
          tokensRef={tokens}
          queryRef={query}
          preSelectedContract={{
            title: community.name ?? '',
            address: community.contractAddress?.address ?? '', // ok to proceed to post composer even if contractAddress is missing (unlikely). user will just be prompted to select a token
          }}
        />
      ),
      headerVariant: 'thicc',
      isFullPage: isMobile,
    });
  }, [showModal, tokens, query, community.name, community.contractAddress?.address, isMobile]);

  const { asPath } = useRouter();

  const currentUrl = useMemo(() => {
    return `${getBaseUrl()}${asPath}`;
  }, [asPath]);
  const handleExternalLinkClick = useCallback(() => {
    track('Community Page: Clicked External Site Link');
  }, [track]);
  const handleShareLinkClick = useCallback(() => {
    track('Community Page: Clicked Copy Share Link');
  }, [track]);

  // KAITO TODO (follow up): also disable if user is not member of community, blocked by backend
  const isPostButtonDisabled = useMemo(() => {
    return query?.viewer?.__typename !== 'Viewer';
  }, [query?.viewer]);

  const ExternalLinks = useMemo(() => {
    return (
      <HStack justify="flex-end">
        {externalAddressLink && (
          <InteractiveLink href={externalAddressLink}>
            <IconContainer
              variant="default"
              tooltipLabel="View on explorer"
              icon={<GlobeIcon />}
              onClick={handleExternalLinkClick}
            />
          </InteractiveLink>
        )}
        <CopyToClipboard textToCopy={currentUrl}>
          <IconContainer
            variant="default"
            tooltipLabel="Copy page url"
            icon={<ShareIcon />}
            onClick={handleShareLinkClick}
          />
        </CopyToClipboard>
      </HStack>
    );
  }, [currentUrl, externalAddressLink, handleExternalLinkClick, handleShareLinkClick]);

  const DescriptionContainer = useMemo(() => {
    if (!description) {
      return null;
    }
    return (
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
    );
  }, [
    description,
    formattedDescription,
    handleShowMoreClick,
    isLineClampEnabled,
    showExpandedDescription,
  ]);

  if (isMobile) {
    return (
      <VStack justify="space-between" gap={16}>
        {ExternalLinks}
        <HStack gap={12} align="center">
          <CommunityProfilePicture communityRef={community} size="xxl" />
          <VStack>
            <TitleDiatypeL>{name}</TitleDiatypeL>
            {DescriptionContainer}
          </VStack>
        </HStack>
        <CommunityPageMetadata communityRef={community} isKoalaEnabled={isKoalaEnabled} />
      </VStack>
    );
  }

  return (
    <VStack gap={24}>
      <StyledContainer>
        <HStack gap={12} align="center">
          <CommunityProfilePicture communityRef={community} size="lg" />
          <TitleL>{name}</TitleL>
          {badgeURL && <StyledBadge src={badgeURL} />}
        </HStack>
        <HStack gap={48}>
          <CommunityPageMetadata communityRef={community} isKoalaEnabled={isKoalaEnabled} />
          {isKoalaEnabled && (
            <StyledButton onClick={handleCreatePostClick} disabled={isPostButtonDisabled}>
              <HStack align="center" gap={4}>
                <PlusSquareIcon stroke={colors.white} height={16} width={16} />
                Post
              </HStack>
            </StyledButton>
          )}
          {ExternalLinks}
        </HStack>
      </StyledContainer>
      {DescriptionContainer}
    </VStack>
  );
}

const StyledContainer = styled.div`
  // handles edge case for tablet view
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: baseline;
  gap: 16px;
  @media only screen and ${breakpoints.desktop} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const StyledDescriptionWrapper = styled(VStack)`
  padding-top: 4px;
`;

const StyledBaseM = styled(BaseM)<{ showExpandedDescription: boolean }>`
  -webkit-line-clamp: ${({ showExpandedDescription }) => (showExpandedDescription ? 'initial' : 3)};
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
  display: -webkit-box;
  @media only screen and ${breakpoints.tablet} {
    line-clamp: 5;
    -webkit-line-clamp: ${({ showExpandedDescription }) =>
      showExpandedDescription ? 'initial' : 5};
  }
`;

const StyledBadge = styled.img`
  max-height: 24px;
  max-width: 24px;
  width: 100%;
`;

const StyledButton = styled(Button)`
  width: 100px;
  height: 32px;
`;
