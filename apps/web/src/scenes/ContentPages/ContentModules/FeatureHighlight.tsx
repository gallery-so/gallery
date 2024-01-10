import { PortableText } from '@portabletext/react';
import { useMemo } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { TitleCondensed, TitleDiatypeL } from '~/components/core/Text/Text';
import colors from '~/shared/theme/colors';

import { CmsTypes } from '../cms_types';

type FeatureHighlightBulletsProps = {
  text: CmsTypes.FeatureHighlight['body'];
};

function FeatureHighlightText({ text }: FeatureHighlightBulletsProps) {
  const CustomComponents = useMemo(() => {
    return {
      listItem: {
        bullet: ({ children }) => (
          <li>
            <StyledText>{children}</StyledText>
          </li>
        ),
      },

      block: ({ children }) => {
        return <StyledText>{children}</StyledText>;
      },
    };
  }, []);

  return (
    <StyledHighlightText>
      <PortableText value={text} components={CustomComponents} />
    </StyledHighlightText>
  );
}

const StyledHighlightText = styled(VStack)`
  ul {
    margin: 0;
  }
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
  // variant?: 'full' | 'condensed';
};

export default function FeatureHighlight({ content }: Props) {
  console.log(content);
  return (
    <StyledHighlight gap={24} orientation={content.orientation}>
      {content.media && (
        <StyledMedia>
          <FeatureHighlightMedia media={content.media} />
        </StyledMedia>
      )}
      <StyledTextSection align="flex-start" gap={content.orientation === 'bottom' ? 16 : 32}>
        {content.headingFont === 'abcDiatype' ? (
          <StyledDiatypeTitle>{content.heading}</StyledDiatypeTitle>
        ) : (
          <StyledGTAlpinaTitle>{content.heading}</StyledGTAlpinaTitle>
        )}

        <FeatureHighlightText text={content.body} />
      </StyledTextSection>
    </StyledHighlight>
  );
}

const StyledHighlight = styled(VStack)<{ orientation: string }>`
  align-items: center;
  // margin: 0 32px;
  justify-content: space-between;
  gap: 32px 120px;
  width: 100%;

  @media only screen and ${breakpoints.desktop} {
    flex-direction: ${({ orientation }) =>
      orientation === 'bottom' ? 'column' : orientation === 'right' ? 'row' : 'row-reverse'};
    // gap: 32px;
    margin: 0;
    // justify-content: flex-end;
  }
`;

const StyledGTAlpinaTitle = styled(TitleCondensed)`
  font-size: 48px;
  text-align: start;
  @media only screen and ${breakpoints.desktop} {
    font-size: 64px;
  }
`;

const StyledDiatypeTitle = styled(TitleDiatypeL)`
  font-size: 32px;
  line-height: 36px;
  text-align: start;
  font-weight: 400;
  letter-spacing: -0.03em;
  @media only screen and ${breakpoints.desktop} {
    font-size: 40px;
    line-height: 46px;
  }
`;

const StyledTextSection = styled(VStack)`
  align-items: flex-start;
  width: 100%;

  @media only screen and ${breakpoints.tablet} {
    // max-width: 480px;
  }
`;

const StyledMedia = styled.div`
  // min-width: 326px;
  // min-height: 326px;
  // max-width: 326px;
  // max-height: 326px;
  // background-color: ${colors.faint};

  @media only screen and ${breakpoints.desktop} {
    // min-width: 500px;
    // min-height: 500px;
    max-width: 500px;
    max-height: 500px;
    width: 100%;
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
  letter-spacing: -0.03em;
  @media only screen and ${breakpoints.desktop} {
    font-size: 20px;
    line-height: 28px;
  }
`;
