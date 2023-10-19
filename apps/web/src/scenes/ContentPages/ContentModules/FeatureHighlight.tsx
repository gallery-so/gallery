import { useMemo } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { TitleCondensed, TitleDiatypeL } from '~/components/core/Text/Text';
import colors from '~/shared/theme/colors';

import { CmsTypes } from '../cms_types';

type FeatureHighlightBulletsProps = {
  bullets: CmsTypes.FeatureHighlight['body'];
};

function FeatureHighlightBullets({ bullets }: FeatureHighlightBulletsProps) {
  const textList = useMemo(
    () => bullets.map((bullet) => bullet.children[0] && bullet.children[0]?.text),
    [bullets]
  );
  return (
    <VStack>
      <StyledList>
        {textList.map((text, index) => (
          <li key={index}>
            <StyledText>{text}</StyledText>
          </li>
        ))}
      </StyledList>
    </VStack>
  );
}

const StyledList = styled.ul`
  padding-left: 24px;
`;

type FeatureHighlightMediaProps = {
  media: CmsTypes.FeatureHighlight['media'];
};

function FeatureHighlightMedia({ media }: FeatureHighlightMediaProps) {
  if (media.video) {
    return <StyledVideo autoPlay loop muted playsInline src={media?.video.asset.url} />;
  }

  if (media.image) {
    return <StyledImage src={media.image.asset.url} />;
  }

  return null;
}

type Props = {
  content: CmsTypes.FeatureHighlight;
};

export default function FeatureHighlight({ content }: Props) {
  return (
    <StyledHighlight gap={24} orientation={content.orientation}>
      <StyledTextSection align="flex-start">
        <StyledTitle>{content.heading}</StyledTitle>
        <FeatureHighlightBullets bullets={content.body} />
      </StyledTextSection>
      {content.media && (
        <StyledMedia>
          <FeatureHighlightMedia media={content.media} />
        </StyledMedia>
      )}
    </StyledHighlight>
  );
}

const StyledHighlight = styled(VStack)<{ orientation: string }>`
  align-items: center;
  margin: 0 32px;

  @media only screen and ${breakpoints.desktop} {
    flex-direction: ${({ orientation }) => (orientation === 'right' ? 'row-reverse' : 'row')};
    gap: 0 32px;
    margin: 0;
  }
`;

const StyledTitle = styled(TitleCondensed)`
  font-size: 48px;
  text-align: start;
  @media only screen and ${breakpoints.desktop} {
    font-size: 64px;
  }
`;

const StyledTextSection = styled(VStack)`
  align-items: flex-start;

  @media only screen and ${breakpoints.tablet} {
    max-width: 480px;
  }
`;

const StyledMedia = styled.div`
  min-width: 326px;
  min-height: 326px;
  max-width: 326px;
  max-height: 326px;
  background-color: ${colors.faint};

  @media only screen and ${breakpoints.desktop} {
    min-width: 500px;
    min-height: 500px;
    max-width: 500px;
    max-height: 500px;
  }
`;
const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
`;
const StyledImage = styled.img`
  width: 100%;
  height: 100%;
`;

const StyledText = styled(TitleDiatypeL)`
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  @media only screen and ${breakpoints.desktop} {
    font-size: 20px;
    line-height: 28px;
  }
`;
