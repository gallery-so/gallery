import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import CopyToClipboard from '~/components/CopyToClipboard/CopyToClipboard';
import breakpoints from '~/components/core/breakpoints';
import TextButton from '~/components/core/Button/TextButton';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import IconContainer from '~/components/core/IconContainer';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeL, TitleL } from '~/components/core/Text/Text';
import CommunityProfilePicture from '~/components/ProfilePicture/CommunityProfilePicture';
import { CommunityPageViewHeaderFragment$key } from '~/generated/CommunityPageViewHeaderFragment.graphql';
import { CommunityPageViewHeaderQueryFragment$key } from '~/generated/CommunityPageViewHeaderQueryFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import CopyIcon from '~/icons/CopyIcon';
import GlobeIcon from '~/icons/GlobeIcon';
import ObjktIcon from '~/icons/ObjktIcon';
import OpenseaIcon from '~/icons/OpenseaIcon';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { extractRelevantMetadataFromCommunity } from '~/shared/utils/extractRelevantMetadataFromCommunity';
import { replaceUrlsWithMarkdownFormat } from '~/shared/utils/replaceUrlsWithMarkdownFormat';
import { truncateAddress } from '~/shared/utils/wallet';
import { getBaseUrl } from '~/utils/getBaseUrl';

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
        ...extractRelevantMetadataFromCommunityFragment
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityPageViewHeaderQueryFragment on Query {
        ...CommunityPageMetadataQueryFragment
      }
    `,
    queryRef
  );

  const isMobile = useIsMobileWindowWidth();

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

  const formattedDescription = replaceUrlsWithMarkdownFormat(description || '');

  const { openseaUrl, objktUrl, externalAddressUrl } =
    extractRelevantMetadataFromCommunity(community);

  const track = useTrack();

  const { asPath } = useRouter();

  const currentUrl = useMemo(() => {
    return `${getBaseUrl()}${asPath}`;
  }, [asPath]);
  const handleOpenseaLinkClick = useCallback(() => {
    track('Community Page: Clicked Opensea Collection Link');
  }, [track]);
  const handleExternalLinkClick = useCallback(() => {
    track('Community Page: Clicked External Site Link');
  }, [track]);
  const handleObjktLinkClick = useCallback(() => {
    track('Community Page: Clicked Objkt Link');
  }, [track]);
  const handleShareLinkClick = useCallback(() => {
    track('Community Page: Clicked Copy Share Link');
  }, [track]);

  const ExternalLinks = useMemo(() => {
    return (
      <HStack justify="flex-end">
        <HStack gap={2}>
          {externalAddressUrl && (
            <GalleryLink
              href={externalAddressUrl}
              eventElementId="External Address Link"
              eventName="External Address Link Click"
              eventContext={contexts.Community}
            >
              <IconContainer
                variant="default"
                tooltipLabel="View on explorer"
                icon={<GlobeIcon />}
                onClick={handleExternalLinkClick}
              />
            </GalleryLink>
          )}
          {openseaUrl && (
            <GalleryLink
              href={openseaUrl}
              eventElementId="Opensea Address Link"
              eventName="Opensea Address Link Click"
              eventContext={contexts.Community}
            >
              <IconContainer
                variant="default"
                tooltipLabel="View on Opensea"
                icon={<OpenseaIcon />}
                onClick={handleOpenseaLinkClick}
              />
            </GalleryLink>
          )}
          {objktUrl && (
            <GalleryLink
              href={objktUrl}
              eventElementId="Objkt Address Link"
              eventName="Objkt Address Link Click"
              eventContext={contexts.Community}
            >
              <IconContainer
                variant="default"
                tooltipLabel="View on Objkt"
                icon={<ObjktIcon />}
                onClick={handleObjktLinkClick}
              />
            </GalleryLink>
          )}
        </HStack>
        <CopyToClipboard textToCopy={currentUrl}>
          <IconContainer
            variant="default"
            tooltipLabel="Copy page url"
            icon={<CopyIcon />}
            onClick={handleShareLinkClick}
          />
        </CopyToClipboard>
      </HStack>
    );
  }, [
    currentUrl,
    externalAddressUrl,
    objktUrl,
    openseaUrl,
    handleExternalLinkClick,
    handleObjktLinkClick,
    handleOpenseaLinkClick,
    handleShareLinkClick,
  ]);

  const DescriptionContainer = useMemo(() => {
    if (!description) {
      return null;
    }

    const buttonText = showExpandedDescription ? 'Show Less' : 'Show More';

    return (
      <StyledDescriptionWrapper gap={8}>
        <StyledBaseM showExpandedDescription={showExpandedDescription} ref={descriptionRef}>
          <Markdown text={formattedDescription} eventContext={contexts.UserGallery} />
        </StyledBaseM>
        {isLineClampEnabled && (
          <TextButton
            eventElementId={`Community Page ${buttonText} Button`}
            eventName={`Community Page ${buttonText}`}
            eventContext={contexts.Community}
            text={buttonText}
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

  const displayName = name || truncateAddress(contractAddress?.address ?? '');

  if (isMobile) {
    return (
      <VStack justify="space-between" gap={16}>
        {ExternalLinks}
        <HStack gap={12} align="center">
          <CommunityProfilePicture communityRef={community} size="xxl" />
          <VStack>
            <TitleDiatypeL>{displayName}</TitleDiatypeL>
            {DescriptionContainer}
          </VStack>
        </HStack>
        <HStack justify="space-between">
          <CommunityPageMetadata communityRef={community} queryRef={query} />
        </HStack>
      </VStack>
    );
  }

  return (
    <VStack gap={24}>
      <StyledContainer>
        <HStack gap={12} align="center">
          <CommunityProfilePicture communityRef={community} size="lg" />
          <TitleL>{displayName}</TitleL>
          {badgeURL && <StyledBadge src={badgeURL} />}
        </HStack>
        <HStack gap={48}>
          <CommunityPageMetadata communityRef={community} queryRef={query} />
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
