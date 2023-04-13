import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseXL, TitleDiatypeL, TitleM } from '~/components/core/Text/Text';

type LandingSection = {
  sectionContent: string;
  sectionTitle: string;
};

type Props = {
  title: string;
  landingSections: LandingSection[];
};

export default function AboutPage({ title, landingSections }: Props) {
  console.log({ landingSections });
  return (
    <StyledPage gap={32} align="center" justify="center">
      <h1>{title}</h1>
      <StyledContent gap={32} align="center">
        {landingSections &&
          landingSections.map((section) => (
            <Section key={1}>
              <SectionTitle>{section.sectionTitle}</SectionTitle>
              <BaseXL>{section.sectionContent}</BaseXL>
            </Section>
          ))}
      </StyledContent>
    </StyledPage>
  );
}

const StyledPage = styled(VStack)`
  height: 100vh;
`;

const SectionTitle = styled(TitleDiatypeL)`
  font-size: 24px;
`;

const Section = styled(VStack)`
  width: 800px;
`;

const StyledContent = styled(VStack)``;
