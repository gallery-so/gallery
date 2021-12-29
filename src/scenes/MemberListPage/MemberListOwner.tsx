import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Heading } from 'components/core/Text/Text';
import { MembershipOwner } from 'types/MembershipTier';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import breakpoints from 'components/core/breakpoints';
import useDebounce from 'hooks/useDebounce';
import { Directions } from 'src/components/core/enums';
import MemberListImagePreview from './MemberListImagePreview';
import detectMobileDevice from 'utils/detectMobileDevice';

type Props = {
  owner: MembershipOwner;
  direction: Directions.LEFT | Directions.RIGHT;
};

function MemberListOwner({ owner, direction }: Props) {
  const [showPreview, setShowPreview] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const debouncedIsHovering = useDebounce(isHovering, 150) as boolean;

  useEffect(() => {
    if (debouncedIsHovering) {
      setShowPreview(true);
    }
  }, [debouncedIsHovering]);

  const onMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsHovering(false);
    setShowPreview(false);
  }, []);

  const isMobile = useMemo(() => detectMobileDevice(), []);

  return (
    <StyledOwner>
      <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <GalleryLink to={`/${owner.username}`} underlined={false} underlineOnHover>
          <StyledUsername>{owner.username}</StyledUsername>
        </GalleryLink>
      </div>
      {!isMobile && showPreview && (
        <MemberListImagePreview direction={direction} nftUrls={owner.preview_nfts} />
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

const StyledUsername = styled(Heading)`
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
`;

export default MemberListOwner;
