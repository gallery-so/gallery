import { useEffect, useRef, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeL } from '~/components/core/Text/Text';
import colors from '~/shared/theme/colors';

import { CmsTypes } from '../cms_types';

type FaqPairProps = {
  content: CmsTypes.Faq;
  isOpen: boolean;
  onClick: () => void;
};

// A pair of question + answer for the FAQ section
function FaqPair({ content, isOpen, onClick }: FaqPairProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [content]);

  const toggleExpansion = useSpring({
    opacity: isOpen ? 1 : 0,
    height: isOpen ? `${contentHeight}px` : '0px',
    config: { duration: 200, easing: (t) => t },
  });

  const rotatePlusIcon = useSpring({
    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    config: { duration: 200, easing: (t) => t },
  });

  const togglePlusIconOpacity = useSpring({
    opacity: isOpen ? 0 : 1,
    config: { duration: 200, easing: (t) => t },
  });

  return (
    <StyledFaqPair isOpen={isOpen} onClick={onClick} justify="space-between">
      <VStack>
        <div>
          <StyledQuestionText>{content.question}</StyledQuestionText>
        </div>
        <AnimatedAnswerContainer style={toggleExpansion} ref={contentRef}>
          <StyledAnswerText>{content.answer}</StyledAnswerText>
        </AnimatedAnswerContainer>
      </VStack>
      <Button style={rotatePlusIcon}>
        <HorizontalLine />
        <VerticalLine style={togglePlusIconOpacity} />
      </Button>
    </StyledFaqPair>
  );
}

const AnimatedAnswerContainer = styled(animated.div)`
  overflow: hidden;
  box-sizing: border-box;
`;

const Line = styled(animated.div)`
  position: absolute;
  background-color: black;
  left: 50%;
  transform: translateX(-50%);
`;

const HorizontalLine = styled(Line)`
  width: 100%;
  height: 1px;
  top: 50%;
`;

const VerticalLine = styled(Line)`
  width: 1px;
  height: 100%;
  top: 0;
`;

const Button = styled(animated.div)`
  margin-top: 8px;
  position: relative;
  width: 12px;
  min-width: 12px;
  height: 12px;
  cursor: pointer;
`;

const StyledFaqPair = styled(HStack)<{ isOpen: boolean }>`
  background-color: ${({ isOpen }) => (isOpen ? colors.offWhite : 'none')};
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
  padding: 8px 16px;
`;

const StyledQuestionText = styled(TitleDiatypeL)`
  font-weight: 400;

  @media only screen and ${breakpoints.desktop} {
    font-size: 20px;
    line-height: 32px;
  }
`;

const StyledAnswerText = styled(TitleDiatypeL)`
  padding: 8px 0;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
`;

type Props = {
  content: CmsTypes.FaqModule;
};

// The FAQ section which contains a list of FaqPairs.
export default function Faq({ content }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <StyledSection gap={64} justify="center">
      <StyledContainer gap={16}>
        <StyledTitle>Frequently asked questions</StyledTitle>
        <StyledQuestionsContainer>
          {content.faqs.map((faq, index) => (
            <FaqPair
              key={index}
              content={faq}
              isOpen={index === openIndex}
              onClick={() => handleClick(index)}
            />
          ))}
        </StyledQuestionsContainer>
      </StyledContainer>
    </StyledSection>
  );
}

const StyledSection = styled(HStack)`
  background-color: ${colors.faint};
  width: 100%;
  padding: 48px 32px;
  margin-bottom: 96px;

  @media only screen and ${breakpoints.desktop} {
    padding: 72px 0;
  }
`;

const StyledContainer = styled(VStack)`
  @media only screen and ${breakpoints.desktop} {
    width: 943px;
    flex-direction: row;
  }
`;

const StyledQuestionsContainer = styled(VStack)`
  width: 100%;
`;

const StyledTitle = styled(TitleDiatypeL)`
  font-weight: 400;
  font-size: 24px;
  line-height: 28px;

  @media only screen and ${breakpoints.desktop} {
    font-size: 36px;
    line-height: 42px;
  }
`;
