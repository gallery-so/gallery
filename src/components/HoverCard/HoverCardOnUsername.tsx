import { useState } from 'react';
import colors from 'components/core/colors';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { BaseM, TitleM } from 'components/core/Text/Text';
import IconButton from 'components/IconButton/IconButton';
import styled from 'styled-components';

type Props = {
  username: string;
};

export default function HoverCardOnUsername({ username }: Props) {
  const [isHovering, setIsHovering] = useState(true);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <StyledContainer>
      <StyledLinkContainer onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <InteractiveLink to={`/${username}`}>{username} test</InteractiveLink>
      </StyledLinkContainer>

      {isHovering && (
        <StyledCardContainer>
          <StyledCardHeader>
            <StyledHoverCardTitleContainer>
              <IconButton />
              <StyledCardUsername>ForgetfulElephantzxczxczxczxczx</StyledCardUsername>
            </StyledHoverCardTitleContainer>

            <BaseM>30 collections</BaseM>
          </StyledCardHeader>

          <StyledCardDescription>
            <BaseM>
              Kristian Levin aka noCreative is a 3D Artist working out of Copenhagen, Denmark. With
              15+ years of experience across multiple disciplines in the creative industry, and
              entered the NFT scene late 2020. Known for his striking, signature 3D cloth work,
              Kristian has developed a notable presence within the NFT art community as an artist,
              collector and curator.
            </BaseM>
          </StyledCardDescription>
        </StyledCardContainer>
      )}
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const StyledLinkContainer = styled.div`
  display: inline-block;
`;

const StyledCardContainer = styled.div`
  border: 1px solid ${colors.offBlack};
  padding: 16px;
  width: 375px;
  display: grid;
  gap: 8px;

  position: absolute;
  background-color: ${colors.white};
  z-index: 1;
  top: calc(100% + 8px);
`;

const StyledCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledHoverCardTitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledCardUsername = styled(TitleM)`
  font-style: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 200px;
`;

const StyledCardDescription = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;
