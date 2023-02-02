import { ReactNode, useCallback, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import Badge from '~/components/Badge/Badge';
import breakpoints from '~/components/core/breakpoints';
import TextButton from '~/components/core/Button/TextButton';
import { StyledAnchor } from '~/components/core/InteractiveLink/InteractiveLink';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleM } from '~/components/core/Text/Text';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { UserNameAndDescriptionHeader$key } from '~/generated/UserNameAndDescriptionHeader.graphql';
import useIs3acProfilePage from '~/hooks/oneOffs/useIs3acProfilePage';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import LinkToNftDetailView from '~/scenes/NftDetailPage/LinkToNftDetailView';
import handleCustomDisplayName from '~/utils/handleCustomDisplayName';
import unescape from '~/utils/unescape';

type Props = {
  userRef: UserNameAndDescriptionHeader$key;
};

export function UserNameAndDescriptionHeader({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment UserNameAndDescriptionHeader on GalleryUser {
        username
        bio
        badges {
          name
          imageURL
          ...BadgeFragment
        }
      }
    `,
    userRef
  );

  const { username, bio, badges } = user;

  const isMobile = useIsMobileWindowWidth();
  const is3ac = useIs3acProfilePage();

  const unescapedBio = useMemo(() => (bio ? unescape(bio) : ''), [bio]);

  const userBadges = useMemo(() => {
    if (!badges) return [];

    return badges.filter((badge) => badge && badge?.imageURL);
  }, [badges]);

  if (!username) {
    return null;
  }

  const displayName = handleCustomDisplayName(username);

  return (
    <Container gap={2}>
      {!isMobile && (
        <HStack align="center" gap={4}>
          <StyledUsername>{displayName}</StyledUsername>

          <HStack align="center" gap={0}>
            {userBadges.map((badge) =>
              badge ? <Badge key={badge.name} badgeRef={badge} /> : null
            )}
          </HStack>
        </HStack>
      )}

      <HStack align="center" gap={8} grow>
        <StyledUserDetails>
          {is3ac ? (
            <ExpandableBio text={unescapedBio} />
          ) : (
            <StyledBioWrapper>
              <Markdown text={unescapedBio} />
            </StyledBioWrapper>
          )}
        </StyledUserDetails>
      </HStack>
    </Container>
  );
}

const ExpandableBio = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const truncated = useMemo(() => {
    return text.split('\n').slice(0, 5).join('\n');
  }, [text]);

  const track = useTrack();

  const handleClick = useCallback(() => {
    setIsExpanded(true);
    track('Read More Button Click: User Bio');
  }, [track]);

  return (
    <VStack gap={12}>
      <BaseM>
        <Markdown
          text={isExpanded ? text : truncated}
          CustomInternalLinkComponent={NftDetailViewer}
        />
      </BaseM>
      {isExpanded ? null : <TextButton text="Read More" onClick={handleClick} />}
    </VStack>
  );
};

type NftDetailViewerProps = {
  href: string;
  children?: ReactNode;
};

const NftDetailViewer = ({ href, children }: NftDetailViewerProps) => {
  const [, username, collectionId, tokenId] = href.split('/');

  if (
    typeof username === 'undefined' ||
    typeof collectionId === 'undefined' ||
    typeof tokenId === 'undefined'
  ) {
    return null;
  }

  return (
    <LinkToNftDetailView username={username} collectionId={collectionId} tokenId={tokenId}>
      <StyledAnchor>{children}</StyledAnchor>
    </LinkToNftDetailView>
  );
};

const StyledBioWrapper = styled(BaseM)`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: unset;
`;

const StyledUsername = styled(TitleM)`
  overflow-wrap: break-word;
  font-style: normal;
`;

const Container = styled(VStack)`
  width: 100%;
`;

const StyledUserDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  word-break: break-word;

  @media only screen and ${breakpoints.tablet} {
    width: 70%;
  }
`;
