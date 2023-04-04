import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints, { size } from '~/components/core/breakpoints';
import colors from '~/components/core/colors';
import { Directions } from '~/components/core/enums';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { BaseXL } from '~/components/core/Text/Text';
import { useMemberListPageActions } from '~/contexts/memberListPage/MemberListPageContext';
import { TokenHolderListItemFragment$key } from '~/generated/TokenHolderListItemFragment.graphql';
import { useBreakpoint } from '~/hooks/useWindowSize';
import useDebounce from '~/shared/hooks/useDebounce';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import detectMobileDevice from '~/utils/detectMobileDevice';
import { graphqlTruncateUniversalUsername } from '~/utils/wallet';

import HoverCardOnUsername from '../HoverCard/HoverCardOnUsername';
import MemberListGalleryPreview from './TokenHolderListGalleryPreview';

type Props = {
  tokenHolderRef: TokenHolderListItemFragment$key;
  direction: Directions.LEFT | Directions.RIGHT;
  fadeUsernames: boolean;
};

const DISABLED_GALLERY_PREVIEW = true;

function TokenHolderListItem({ tokenHolderRef, direction, fadeUsernames }: Props) {
  const { setFadeUsernames } = useMemberListPageActions();

  const owner = useFragment(
    graphql`
      fragment TokenHolderListItemFragment on TokenHolder {
        user @required(action: THROW) {
          username @required(action: THROW)
          universal

          ...walletTruncateUniversalUsernameFragment
          ...HoverCardOnUsernameFragment
        }
        previewTokens
      }
    `,
    tokenHolderRef
  );

  const username = graphqlTruncateUniversalUsername(owner.user);

  // We want to debounce the isHover state to ensure we only render the preview images if the user *deliberately* hovers over the username,
  // instead of if they just momentarily hover over it when moving their cursor or scrolling down the page.

  const [startFadeOut, setStartFadeOut] = useState(false);
  // isHovering is updated immediately on mouseEnter and mouseLeave.
  const [isHovering, setIsHovering] = useState(false);
  // debounce isHovering by 150ms. so debouncedIsHovering will only be true if the user hovers over a name for at least 150ms.
  const debouncedIsHovering = useDebounce(isHovering, 150);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // If the user hovered over the name for at least 150ms, show the preview.
    if (debouncedIsHovering) {
      setShowPreview(true);
      return;
    }
    // If the user stopped hovering over the name and we are currently showing the preview, fade out the preview.
    if (!debouncedIsHovering && showPreview) {
      setStartFadeOut(true);
      // Delay hiding the preview so we the fadeout animation has time to finish.
      setTimeout(() => {
        setShowPreview(false);
        setStartFadeOut(false);
      }, 500);
    }
  }, [debouncedIsHovering, showPreview]);

  const onMouseEnter = useCallback(() => {
    setIsHovering(true);
    setFadeUsernames(true);
  }, [setFadeUsernames]);

  const onMouseLeave = useCallback(() => {
    setIsHovering(false);
    setFadeUsernames(false);
  }, [setFadeUsernames]);

  const breakpoint = useBreakpoint();

  const isDesktop = useMemo(
    () => breakpoint === size.desktop && !detectMobileDevice(),
    [breakpoint]
  );

  const previewTokens = useMemo(
    () => (owner.previewTokens ? removeNullValues(owner.previewTokens) : null),
    [owner.previewTokens]
  );

  const openseaProfileLink = `https://opensea.io/${owner.user.username}`;

  return (
    <StyledOwner>
      <StyledUsernameWrapper onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {owner.user.universal ? (
          <StyledGalleryLink
            href={openseaProfileLink}
            underlined={false}
            fadeUsernames={fadeUsernames}
          >
            <StyledUsername>{username}</StyledUsername>
          </StyledGalleryLink>
        ) : (
          <HoverCardOnUsername userRef={owner.user}>
            <StyledGalleryLink
              to={{ pathname: '/[username]', query: { username: owner.user.username } }}
              underlined={false}
              fadeUsernames={fadeUsernames}
            >
              <StyledUsername>{username}</StyledUsername>
            </StyledGalleryLink>
          </HoverCardOnUsername>
        )}
      </StyledUsernameWrapper>
      {isDesktop &&
        showPreview &&
        previewTokens &&
        !owner.user.universal &&
        !DISABLED_GALLERY_PREVIEW && (
          <MemberListGalleryPreview
            direction={direction}
            tokenUrls={previewTokens}
            startFadeOut={startFadeOut}
          />
        )}
    </StyledOwner>
  );
}

const StyledOwner = styled.div`
  width: 50%;
  flex-shrink: 0;
  display: flex;

  @media only screen and ${breakpoints.tablet} {
    width: 33%;
  }

  @media only screen and ${breakpoints.desktop} {
    width: 25%;
  }

  &:hover {
    color: ${colors.offBlack};
  }
`;

const StyledUsernameWrapper = styled.div`
  max-width: 100%;
`;

const StyledGalleryLink = styled(GalleryLink)<{ fadeUsernames: boolean }>`
  transition: color 0.15s ease-in-out;
  color: ${({ fadeUsernames }) => (fadeUsernames ? colors.porcelain : colors.offBlack)};
  &:hover {
    color: ${colors.offBlack};
  }
`;

const StyledUsername = styled(BaseXL)`
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 16px;
  color: inherit;
`;

export default TokenHolderListItem;
