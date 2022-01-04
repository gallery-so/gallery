import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Heading } from 'components/core/Text/Text';
import { MembershipOwner } from 'types/MembershipTier';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import breakpoints, { size } from 'components/core/breakpoints';
import useDebounce from 'hooks/useDebounce';
import { Directions } from 'src/components/core/enums';
import MemberListImagePreview from './MemberListImagePreview';
import detectMobileDevice from 'utils/detectMobileDevice';
import { useBreakpoint } from 'hooks/useWindowSize';

type Props = {
  owner: MembershipOwner;
  direction: Directions.LEFT | Directions.RIGHT;
};

function MemberListOwner({ owner, direction }: Props) {
  const [showPreview, setShowPreview] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [startFadeOut, setStartFadeOut] = useState(false);
  const debouncedIsHovering = useDebounce(isHovering, 150) as boolean;

  useEffect(() => {
    if (debouncedIsHovering) {
      setShowPreview(true);
      return;
    }

    // Delay hiding the preview so we can show a fadeout animation
    if (!debouncedIsHovering && showPreview) {
      setStartFadeOut(true);
      setTimeout(() => {
        setShowPreview(false);
        setStartFadeOut(false);
      }, 500);
    }
  }, [debouncedIsHovering, showPreview]);

  const onMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  const breakpoint = useBreakpoint();

  const isDesktop = useMemo(
    () => breakpoint === size.desktop && !detectMobileDevice(),
    [breakpoint]
  );

  return (
    <StyledOwner>
      <StyledUsernameWrapper onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <GalleryLink to={`/${owner.username}`} underlined={false} underlineOnHover>
          <StyledUsername>{owner.username}</StyledUsername>
        </GalleryLink>
      </StyledUsernameWrapper>
      {isDesktop && showPreview && owner.preview_nfts && (
        <MemberListImagePreview
          direction={direction}
          nftUrls={owner.preview_nfts}
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
`;

const StyledUsernameWrapper = styled.div`
  max-width: 100%;
`;

const StyledUsername = styled(Heading)`
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 16px;
`;

export default MemberListOwner;
