import unescape from 'lodash/unescape';
import CloseBracket from 'public/icons/close_bracket.svg';
import OpenBracket from 'public/icons/open_bracket.svg';
import styled from 'styled-components';

import { pageGutter } from '~/components/core/breakpoints';
import { BaseXL, TitleDiatypeL } from '~/components/core/Text/Text';
import ProcessedText from '~/components/ProcessedText/ProcessedText';

import { RawProfilePicture } from '../ProfilePicture/RawProfilePicture';

type Props = {
  username: string;
  caption?: string;
  imageUrl: string;
  profileImageUrl?: string;
};

export const PostOpenGraphPreview = ({ username, caption, imageUrl, profileImageUrl }: Props) => {
  return (
    <StyledContainer>
      <StyledGalleryContainer>
        <OpenBracket style={{ width: '196px', height: '196px' }} viewBox="0 0 36 121" />
        <StyledPostContent>
          <StyledImage src={imageUrl} />

          <StyledTextContainer>
            <StyledUserInfoContainer>
              {profileImageUrl ? (
                <RawProfilePicture imageUrl={profileImageUrl} size="lg" />
              ) : (
                <RawProfilePicture letter={username[0] ?? ''} size="md" />
              )}
              <StyledUsername>{unescape(username)}</StyledUsername>
            </StyledUserInfoContainer>
            <StyledDescription>
              {caption ? (
                <ProcessedText text={caption} eventContext={null} />
              ) : (
                <>
                  View this post on <strong>gallery.so</strong>
                </>
              )}
            </StyledDescription>
          </StyledTextContainer>
        </StyledPostContent>
        <CloseBracket style={{ width: '196px', height: '196px' }} viewBox="0 0 36 121" />
      </StyledGalleryContainer>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  padding: ${pageGutter.tablet}px 0;
  background-color: #ffffff;
  position: relative;
`;

const StyledGalleryContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;

  justify-content: center;
`;

const StyledPostContent = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 70px;
  align-items: center;
  justify-content: center;
`;

const StyledUserInfoContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
`;

const StyledTextContainer = styled.div`
  display: grid;
  gap: 12px;
`;

const StyledImage = styled.img`
  max-width: 370px;
  width: auto;
  max-height: 370px;
  height: auto;
  display: block;
  margin: 0 auto;
`;

const StyledUsername = styled(TitleDiatypeL)`
  font-size: 32px;
  line-height: 36px;
`;

const StyledDescription = styled(BaseXL)`
  font-size: 26px;
  line-height: 32px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  max-width: 600px;
`;
