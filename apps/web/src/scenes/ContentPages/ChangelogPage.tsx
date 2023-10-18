import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import styled from 'styled-components';

import breakpoints, { pageGutter } from '~/components/core/breakpoints';
import Markdown from '~/components/core/Markdown/Markdown';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeL } from '~/components/core/Text/Text';
import { contexts } from '~/shared/analytics/constants';

export type ChangelogSection = {
  header: string;
  summary: string;
  improvementsAndFixes: string;
  _id: string;
};

type Props = {
  sections: ChangelogSection[];
};

function dateToSlug(date: string) {
  return date.replace(/( |, )/g, '-').toLowerCase();
}

export default function ChangelogPage({ sections }: Props) {
  const { asPath } = useRouter();
  useEffect(() => {
    const hash = asPath.split('#')[1];
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    }
  }, [asPath]);
  return (
    <>
      <Head>
        <title>Gallery | Changelog</title>
      </Head>
      <StyledPage gap={48}>
        <PageTitle>Changelog</PageTitle>
        <StyledContent gap={64} align="baseline">
          {sections &&
            sections.map((section) => (
              <StyledSection key={section._id} id={dateToSlug(section.header)}>
                <SectionDate>{section.header}</SectionDate>
                <VStack gap={16}>
                  {section.summary && (
                    <BaseM>
                      <Markdown text={section.summary} eventContext={contexts.Changelog} />
                    </BaseM>
                  )}
                  <VStack gap={8}>
                    <TitleDiatypeL>Changes and Improvements</TitleDiatypeL>
                    <BaseM>
                      <Markdown
                        text={section.improvementsAndFixes}
                        eventContext={contexts.Changelog}
                      />
                    </BaseM>
                  </VStack>
                </VStack>
              </StyledSection>
            ))}
        </StyledContent>
      </StyledPage>
    </>
  );
}

const PageTitle = styled(TitleDiatypeL)`
  font-size: 36px;
  line-height: 36px;

  @media only screen and ${breakpoints.desktop} {
    width: 800px;
  }
`;

const StyledPage = styled(VStack)`
  align-items: flex-start;
  min-height: 100vh;
  margin: 80px ${pageGutter.mobile}px;

  @media only screen and ${breakpoints.desktop} {
    align-items: center;
    margin: 80px 240px;
    gap: 96px;
  }
`;

const SectionDate = styled(BaseM)`
  min-width: 200px;
  width: 200px;
  font-weight: 600;
  text-transform: uppercase;
`;

const StyledContent = styled(VStack)`
  max-width: 800px;
`;

const StyledSection = styled(VStack)`
  gap: 8px;

  @media only screen and ${breakpoints.desktop} {
    flex-direction: row;
    gap: 32px;
  }
`;
