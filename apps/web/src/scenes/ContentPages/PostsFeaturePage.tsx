import Head from 'next/head';
import { useCallback } from 'react';
import styled from 'styled-components';

import breakpoints, { pageGutter } from '~/components/core/breakpoints';
import { ButtonLink } from '~/components/core/Button/Button';
import Markdown from '~/components/core/Markdown/Markdown';
import { VStack } from '~/components/core/Spacer/Stack';
import { TitleCondensed, TitleDiatypeL } from '~/components/core/Text/Text';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';

import { CmsTypes } from './cms_types';
import Faq from './ContentModules/Faq';
import FeatureHighlight from './ContentModules/FeatureHighlight';

type Props = {
  pageContent: CmsTypes.FeaturePage;
};

export default function PostsFeaturePage({ pageContent }: Props) {
  const track = useTrack();
  const handleGetStartedClick = useCallback(() => {
    track('Posts Feature Page: Clicked Get Started');
  }, [track]);

  return (
    <>
      <Head>
        <title>Gallery | Posts</title>
      </Head>
      <StyledPage gap={96}>
        <StyledContent align="center" gap={96}>
          <StyledIntro gap={48} align="center">
            <VStack gap={32}>
              <VStack>
                <StyledHeading>Introducing</StyledHeading>
                <StyledHeading>
                  <strong>Posts</strong>
                </StyledHeading>
              </VStack>
              <StyledSubheading>{pageContent.introText}</StyledSubheading>
            </VStack>
            <GetStartedButton
              href={{ pathname: '/auth' }}
              onClick={handleGetStartedClick}
              data-testid="sign-in-button"
            >
              <TitleDiatypeL color={colors.white}>Get Started</TitleDiatypeL>
            </GetStartedButton>
          </StyledIntro>
          <StyledSplashImage src={pageContent.splashImage.asset.url} />
          <VStack gap={96}>
            {pageContent.featureHighlights.map((highlight) => (
              <FeatureHighlight key={highlight.heading} content={highlight} />
            ))}
          </VStack>
          <VStack align="center" gap={32}>
            {pageContent.externalLink && (
              <StyledSubheading>
                <Markdown text={pageContent.externalLink} />
              </StyledSubheading>
            )}
            <GetStartedButton
              href={{ pathname: '/auth' }}
              onClick={handleGetStartedClick}
              data-testid="sign-in-button"
            >
              <TitleDiatypeL color={colors.white}>Get Started</TitleDiatypeL>
            </GetStartedButton>
          </VStack>
        </StyledContent>
        <Faq content={pageContent.faqModule} />
      </StyledPage>
    </>
  );
}

const StyledPage = styled(VStack)`
  align-items: flex-start;
  min-height: 100vh;
  margin-top: 32px;

  @media only screen and ${breakpoints.desktop} {
    align-items: center;
  }
`;

const StyledContent = styled(VStack)`
  width: 100%;
  @media only screen and ${breakpoints.desktop} {
    width: 1080px;
    margin: 80px ${pageGutter.mobile}px 0;
  }
`;

const StyledIntro = styled(VStack)`
  margin: 0 32px;
`;

const StyledHeading = styled(TitleCondensed)`
  font-size: 72px;
  line-height: 56px;
  width: 100%;

  font-weight: 400;

  strong {
    font-style: italic;
    font-weight: 400;
  }

  @media only screen and ${breakpoints.desktop} {
    font-size: 128px;
    line-height: 96px;
    width: 500px;
  }
`;

const StyledSubheading = styled(TitleDiatypeL)`
  font-size: 16px;
  line-height: 20px;
  font-weight: 400;
  text-align: center;

  a {
    font-size: 16px;
  }

  @media only screen and ${breakpoints.tablet} {
    max-width: 326px;
  }

  @media only screen and ${breakpoints.desktop} {
    font-size: 24px;
    line-height: 32px;
    max-width: 500px;
    a {
      font-size: 24px;
    }
  }
`;

const GetStartedButton = styled(ButtonLink)`
  text-transform: initial;
  padding: 8px 32px;
  width: fit-content;

  &:hover {
    opacity: 0.8;
  }
`;

const StyledSplashImage = styled.img`
  width: 100%;

  @media only screen and ${breakpoints.tablet} {
    max-width: 480px;
  }
  @media only screen and ${breakpoints.desktop} {
    max-width: 720px;
  }
`;
