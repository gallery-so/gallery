import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Heading } from 'components/core/Text/Text';
import { MembershipOwner } from 'types/MembershipTier';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import breakpoints from 'components/core/breakpoints';
import useDebounce from 'hooks/useDebounce';
import { Directions } from 'src/components/core/enums';

type Props = {
  owner: MembershipOwner;
  direction: Directions.LEFT | Directions.RIGHT;
};

function MemberListOwner({ owner, direction }: Props) {
  const [showPreview, setShowPreview] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const debouncedIsHovering = useDebounce(isHovering, 200) as boolean;

  useEffect(() => {
    setShowPreview(debouncedIsHovering);
  }, [debouncedIsHovering]);

  const onMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsHovering(false);
    setShowPreview(false);
  }, []);

  return (
    <StyledOwner>
      <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <GalleryLink to={`/${owner.username}`} underlined={false} underlineOnHover>
          <StyledUsername>{owner.username}</StyledUsername>
        </GalleryLink>
      </div>
      {showPreview && (
        <StyledPreview>
          <StyledPreviewImageWrapper direction={direction}>
            <StyledPreviewImage src={`${owner.preview_nfts[0]}=s250`} top={100} left={40} />
            <StyledPreviewImage src={`${owner.preview_nfts[1]}=s250`} top={0} left={0} />
            <StyledPreviewImage src={`${owner.preview_nfts[2]}=s250`} top={200} left={140} />
          </StyledPreviewImageWrapper>
        </StyledPreview>
      )}
    </StyledOwner>
  );
}

const StyledOwner = styled.div`
  width: 50%;
  flex-shrink: 0;

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

const StyledPreview = styled.div`
  position: relative;
`;

type StyledPreviewImageWrapperProps = {
  direction: Directions.LEFT | Directions.RIGHT;
};

const StyledPreviewImageWrapper = styled.div<StyledPreviewImageWrapperProps>`
  position: absolute;
  top: -150px;
  left: ${({ direction }) => (direction === Directions.RIGHT ? '200px' : '-400px')};
`;

type StyledPreviewImageProps = {
  top: number;
  left: number;
};

const StyledPreviewImage = styled.img<StyledPreviewImageProps>`
  position: absolute;
  top: ${({ top }) => top}px;
  left: ${({ left }) => left}px;
`;

export default MemberListOwner;
