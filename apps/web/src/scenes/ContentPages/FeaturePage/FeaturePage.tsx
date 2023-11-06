import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import breakpoints, { pageGutter } from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import Markdown from '~/components/core/Markdown/Markdown';
import { VStack } from '~/components/core/Spacer/Stack';
import { TitleCondensed, TitleDiatypeL, TitleXS } from '~/components/core/Text/Text';
import { FeaturePageContentQuery } from '~/generated/FeaturePageContentQuery.graphql';
import { contexts, flows } from '~/shared/analytics/constants';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';

import { CmsTypes } from '../cms_types';
import Faq from '../ContentModules/Faq';
import FeatureHighlight from '../ContentModules/FeatureHighlight';

type Props = {
  pageContent: CmsTypes.FeaturePage;
  ctaAuthenticatedButtonRoute: Route;
  eventProperties: GalleryElementTrackingProps;
};

export function FeaturePage({ pageContent, ctaAuthenticatedButtonRoute, eventProperties }: Props) {
  const query = useLazyLoadQuery<FeaturePageContentQuery>(
    graphql`
      query FeaturePageContentQuery {
        viewer {
          __typename
        }
      }
    `,
    {}
  );

  const isAuthenticated = query.viewer?.__typename === 'Viewer';
  const ctaButtonRoute: Route = useMemo(() => {
    if (!isAuthenticated) return { pathname: '/auth' };

    return ctaAuthenticatedButtonRoute;
  }, [ctaAuthenticatedButtonRoute, isAuthenticated]);

  return (
    <StyledPage gap={96}>
      <StyledContent align="center" gap={96}>
        <StyledIntro align="center" gap={48}>
          <VStack align="center" gap={32}>
            <VStack align="center" gap={16}>
              <VStack>
                <StyledHeading>Introducing</StyledHeading>
                <StyledHeading>
                  <strong>{pageContent.title}</strong>
                </StyledHeading>
              </VStack>
              <StyledBetaPill>
                <TitleXS color={colors.activeBlue}>BETA</TitleXS>
              </StyledBetaPill>
            </VStack>
            <StyledSubheading>{pageContent.introText}</StyledSubheading>
          </VStack>
          <GalleryLink to={ctaButtonRoute} {...eventProperties}>
            <GetStartedButton eventElementId={null} eventName={null} eventContext={null}>
              <TitleDiatypeL color={colors.white}>Get Started</TitleDiatypeL>
            </GetStartedButton>
          </GalleryLink>
        </StyledIntro>
        <StyledSplashImage src={pageContent.splashImage?.asset.url} />
        <VStack gap={96}>
          {pageContent.featureHighlights?.map((highlight) => (
            <FeatureHighlight key={highlight.heading} content={highlight} />
          ))}
        </VStack>
        <VStack align="center" gap={32}>
          {pageContent.externalLink && (
            <StyledSubheading>
              <Markdown text={pageContent.externalLink} eventContext={contexts.Posts} />
            </StyledSubheading>
          )}
          <GalleryLink to={ctaButtonRoute} {...eventProperties}>
            <GetStartedButton eventElementId={null} eventName={null} eventContext={null}>
              <TitleDiatypeL color={colors.white}>Get Started</TitleDiatypeL>
            </GetStartedButton>
          </GalleryLink>
        </VStack>
      </StyledContent>
      <Faq content={pageContent.faqModule} />
    </StyledPage>
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
    max-width: 900px;
  }
`;

const StyledBetaPill = styled.div`
  width: fit-content;
  border-radius: 24px;
  padding: 4px 12px;
  border: 1px solid ${colors.activeBlue};
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

const GetStartedButton = styled(Button)`
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
