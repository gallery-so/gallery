import { useMemo } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { TitleCondensed, TitleDiatypeL } from '~/components/core/Text/Text';

import { CmsTypes } from '../cms_types';

type FeatureHighlightBulletsProps = {
  bullets: CmsTypes.FeatureHighlight['body'];
};

function FeatureHighlightBullets({ bullets }: FeatureHighlightBulletsProps) {
  const textList = useMemo(
    () => bullets.map((bullet) => bullet.children[0] && bullet.children[0].text),
    [bullets]
  );
  return (
    <VStack>
      <ul>
        {textList.map((text, index) => (
          <li key={index}>
            <StyldText>{text}</StyldText>
          </li>
        ))}
      </ul>
    </VStack>
  );
}

type FeatureHighlightMediaProps = {
  media: CmsTypes.FeatureHighlight['media'];
};

function FeatureHighlightMedia({ media }: FeatureHighlightMediaProps) {
  if (media.video) {
    return <StyledVideo autoPlay loop muted src={media?.video.asset.url} />;
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
      <StyledSection align="flex-start">
        <StyledTitle>{content.heading}</StyledTitle>
        <FeatureHighlightBullets bullets={content.body} />
      </StyledSection>
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
  @media only screen and ${breakpoints.desktop} {
    font-size: 64px;
  }
`;

const StyledSection = styled(VStack)`
  align-items: flex-start;

  @media only screen and ${breakpoints.tablet} {
    align-items: center;
    max-width: 480px;
  }

  @media only screen and ${breakpoints.desktop} {
    align-items: flex-start;
  }
`;

const StyledMedia = styled.div`
  min-width: 326px;
  min-height: 326px;
  max-width: 326px;
  max-height: 326px;

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

const StyldText = styled(TitleDiatypeL)`
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  @media only screen and ${breakpoints.desktop} {
    font-size: 20px;
    line-height: 28px;
  }
`;
