import unescape from 'lodash/unescape';
import CloseBracket from 'public/icons/close_bracket.svg';
import OpenBracket from 'public/icons/open_bracket.svg';
import styled from 'styled-components';

import { pageGutter } from '~/components/core/breakpoints';
import { BaseS, TitleDiatypeL } from '~/components/core/Text/Text';
import ProcessedText from '~/components/ProcessedText/ProcessedText';
import colors from '~/shared/theme/colors';

import { RawProfilePicture } from '../ProfilePicture/RawProfilePicture';

type Props = {
  username: string;
  caption?: string;
  imageUrl: string;
  profileImageUrl?: string;
};

export const MiniPostOpenGraphPreview = ({
  username,
  caption,
  imageUrl,
  profileImageUrl,
}: Props) => {
  return (
    <StyledContainer>
      <StyledGalleryContainer>
        <OpenBracket style={{ width: '58px', height: '58px' }} viewBox="0 0 36 121" />
        <StyledPostContent>
          <StyledImage src={imageUrl} />

          <StyledTextContainer>
            <StyledUserInfoContainer>
              {profileImageUrl ? (
                <RawProfilePicture imageUrl={profileImageUrl} size="xs" />
              ) : (
                <RawProfilePicture letter={username[0] ?? ''} size="xs" />
              )}
              <StyledUsername>{unescape(username)}</StyledUsername>
            </StyledUserInfoContainer>
            <StyledDescription>
              {caption ? (
                <ProcessedText text={unescape(caption)} eventContext={null} />
              ) : (
                <>
                  View this post on <strong>gallery.so</strong>
                </>
              )}
            </StyledDescription>
          </StyledTextContainer>
        </StyledPostContent>
        <CloseBracket style={{ width: '58px', height: '58px' }} viewBox="0 0 36 121" />
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
  background-color: ${colors.offWhite};
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
  gap: 20px;
  align-items: center;
  justify-content: center;
`;

const StyledUserInfoContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 4px;
  align-items: center;
  justify-content: flex-start;
`;

const StyledTextContainer = styled.div`
  display: grid;
  gap: 2px;
`;

const StyledImage = styled.img`
  max-width: 109px;
  width: auto;
  max-height: 109px;
  height: auto;
  display: block;
  margin: 0 auto;
`;

const StyledUsername = styled(TitleDiatypeL)`
  font-size: 15px;
  line-height: 14px;
`;

const StyledDescription = styled(BaseS)`
  font-size: 11px;
  line-height: 12px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  max-width: 600px;
`;
