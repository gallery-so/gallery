import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import colors from 'shared/theme/colors';
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
import { NewTooltip } from '~/components/Tooltip/NewTooltip';
import { useTooltipHover } from '~/components/Tooltip/useTooltipHover';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { CommunityPageViewHeaderFragment$key } from '~/generated/CommunityPageViewHeaderFragment.graphql';
import { CommunityPageViewHeaderQueryFragment$key } from '~/generated/CommunityPageViewHeaderQueryFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import CopyIcon from '~/icons/CopyIcon';
import { EditPencilIcon } from '~/icons/EditPencilIcon';
import GlobeIcon from '~/icons/GlobeIcon';
import ObjktIcon from '~/icons/ObjktIcon';
import OpenseaIcon from '~/icons/OpenseaIcon';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { extractRelevantMetadataFromCommunity } from '~/shared/utils/extractRelevantMetadataFromCommunity';
import { replaceUrlsWithMarkdownFormat } from '~/shared/utils/replaceUrlsWithMarkdownFormat';
import { truncateAddress } from '~/shared/utils/wallet';
import { getBaseUrl } from '~/utils/getBaseUrl';

import { CommunityMetadataFormModal } from './CommunityMetadataFormModal';
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
        ...CommunityPageMetadataFragment
        ...CommunityProfilePictureFragment
        ...extractRelevantMetadataFromCommunityFragment
        ...CommunityMetadataFormModalFragment
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityPageViewHeaderQueryFragment on Query {
        ...CommunityPageMetadataQueryFragment
        ...CommunityMetadataFormModalQueryFragment
      }
    `,
    queryRef
  );

  const isMobile = useIsMobileWindowWidth();

  const { name, description, badgeURL } = community;
  const { showModal } = useModalActions();

  // whether "Show More" has been clicked or not
  const [showExpandedDescription, setShowExpandedDescription] = useState(false);
  // whether or not the description appears truncated
  const [isLineClampEnabled, setIsLineClampEnabled] = useState(false);

  const descriptionRef = useRef<HTMLParagraphElement>(null);

  const handleShowMoreClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
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

  const { contractAddress, openseaUrl, objktUrl, externalAddressUrl } =
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

  const handleEditClick = useCallback(() => {
    showModal({
      content: <CommunityMetadataFormModal communityRef={community} queryRef={query} />,
      isFullPage: false,
      headerText: 'Request changes',
    });
  }, [community, query, showModal]);

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

  const {
    floating: editDescriptionFloating,
    reference: editDescriptionReference,
    getFloatingProps: getEditDescriptionFloatingProps,
    getReferenceProps: getEditDescriptionReferenceProps,
    floatingStyle: editDescriptionFloatingStyle,
  } = useTooltipHover({
    placement: 'top-end',
    offsetOptions: 15,
  });

  const DescriptionContainer = useMemo(() => {
    if (!description) {
      return null;
    }

    const buttonText = showExpandedDescription ? 'Show Less' : 'Show More';

    return (
      <StyledDescriptionWrapper
        gap={8}
        onClick={handleEditClick}
        {...getEditDescriptionReferenceProps()}
        ref={editDescriptionReference}
      >
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

        <StyledEditIconWrapper>
          <EditPencilIcon />
        </StyledEditIconWrapper>

        <StyledTooltip
          {...getEditDescriptionFloatingProps()}
          style={editDescriptionFloatingStyle}
          ref={editDescriptionFloating}
          text="Edit description"
        />
      </StyledDescriptionWrapper>
    );
  }, [
    description,
    formattedDescription,
    handleEditClick,
    handleShowMoreClick,
    isLineClampEnabled,
    showExpandedDescription,
    editDescriptionReference,
    editDescriptionFloating,
    editDescriptionFloatingStyle,
    getEditDescriptionFloatingProps,
    getEditDescriptionReferenceProps,
  ]);

  const displayName = name || truncateAddress(contractAddress);

  const [isProfilePictureHovered, setIsProfilePictureHovered] = useState(false);
  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({ placement: 'right-end' });

  const {
    floating: editTitleFloating,
    reference: editTitleReference,
    getFloatingProps: getEditTitleFloatingProps,
    getReferenceProps: getEditTitleReferenceProps,
    floatingStyle: editTitleFloatingStyle,
  } = useTooltipHover({
    placement: 'right-start',
    offsetOptions: 15,
  });

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
          <div
            onMouseEnter={() => setIsProfilePictureHovered(true)}
            onMouseLeave={() => setIsProfilePictureHovered(false)}
            onClick={handleEditClick}
            {...getReferenceProps()}
            ref={reference}
          >
            <CommunityProfilePicture
              communityRef={community}
              size="lg"
              isEditable={isProfilePictureHovered}
              editIconSize={18}
            />

            <StyledTooltip
              {...getFloatingProps()}
              style={floatingStyle}
              ref={floating}
              text="Edit profile picture"
            />
          </div>
          <StyledCommunityNameWrapper
            onClick={handleEditClick}
            gap={12}
            align="center"
            {...getEditTitleReferenceProps()}
            ref={editTitleReference}
          >
            <TitleL>{displayName}</TitleL>
            {badgeURL && <StyledBadge src={badgeURL} />}

            <StyledEditIconWrapper>
              <EditPencilIcon />
            </StyledEditIconWrapper>

            <StyledTooltip
              {...getEditTitleFloatingProps()}
              style={editTitleFloatingStyle}
              ref={editTitleFloating}
              text="Edit title"
            />
          </StyledCommunityNameWrapper>
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

const StyledEditIconWrapper = styled.div`
  width: 18px;
  height: 18px;
  background-color: ${colors.faint};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  cursor: pointer;

  display: none;
`;

const StyledCommunityNameWrapper = styled(HStack)`
  position: relative;
  cursor: pointer;

  &:hover {
    ${StyledEditIconWrapper} {
      display: flex;
    }
  }
  ${StyledEditIconWrapper} {
    position: absolute;
    right: -24px;
    bottom: 0px;
  }
`;

const StyledDescriptionWrapper = styled(VStack)`
  position: relative;
  padding: 8px 32px 8px 0px;
  cursor: pointer;

  @media only screen and ${breakpoints.tablet} {
    padding-left: 8px;
    padding-right: 56px;
  }

  &:hover {
    background-color: ${colors.offWhite};

    ${StyledEditIconWrapper} {
      display: flex;
    }
  }

  ${StyledEditIconWrapper} {
    position: absolute;
    right: 8px;
    top: 8px;
  }
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

const StyledTooltip = styled(NewTooltip)`
  display: none;
  @media only screen and ${breakpoints.tablet} {
    display: block;
  }
`;
