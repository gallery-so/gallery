import styled from 'styled-components';
import colors from '../colors';

const TITLE_FONT_FAMILY = "'GT Alpina', serif";
export const BODY_FONT_FAMILY = "'ABC Diatype', Helvetica, Arial, sans-serif";
export const BODY_MONO_FONT_FAMILY = "'ABC Diatype Mono', monospace";

type TextProps = {
  color?: colors;
  caps?: boolean;
};

const H1 = styled.h1<TextProps>`
  margin: 0;
  color: ${({ color }) => (color ? color : colors.offBlack)};
  text-transform: ${({ caps }) => (caps ? 'uppercase' : undefined)};
`;

const H2 = styled.h2<TextProps>`
  margin: 0;
  color: ${({ color }) => (color ? color : colors.offBlack)};
  text-transform: ${({ caps }) => (caps ? 'uppercase' : undefined)};
`;

const H3 = styled.h3<TextProps>`
  margin: 0;
  color: ${({ color }) => (color ? color : colors.offBlack)};
  text-transform: ${({ caps }) => (caps ? 'uppercase' : undefined)};
`;

const Paragraph = styled.p<TextProps>`
  margin: 0;
  color: ${({ color }) => (color ? color : colors.offBlack)};
  text-transform: ${({ caps }) => (caps ? 'uppercase' : undefined)};
`;

export const TitleL = styled(H1)`
  font-family: ${TITLE_FONT_FAMILY};
  font-size: 32px;
  font-weight: 400;
  line-height: 36px;
  letter-spacing: 0px;
  letter-spacing: -0.03em;
`;

export const TitleM = styled(H2)`
  font-family: ${TITLE_FONT_FAMILY};
  font-size: 24px;
  line-height: 28px;
  font-weight: 400;
  font-style: italic;
  letter-spacing: -0.04em;

  // wrap text with strong to stylize as non-italic
  strong {
    font-weight: 400;
    font-style: initial;
  }
`;

export const TitleS = styled(H3)`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  letter-spacing: -0.01em;
`;

export const TitleXSBold = styled(H3)`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
`;

export const TitleXS = styled(H3)`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  text-transform: uppercase;
`;

export const BaseXL = styled(Paragraph)`
  font-family: ${BODY_FONT_FAMILY};
  font-weight: 400;
  font-size: 18px;
  line-height: 24px;
`;

export const BaseM = styled(Paragraph)`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 14px;
  line-height: 20px;
`;

export const BaseS = styled(Paragraph)`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 12px;
  line-height: 16px;
`;

export const TitleDiatypeL = styled(H1)`
  font-family: ${BODY_FONT_FAMILY};
  font-weight: 700;
  font-size: 18px;
  line-height: 24px;
  letter-spacing: -0.01em;
`;

export const TitleDiatypeM = styled(H2)`
  font-family: ${BODY_FONT_FAMILY};
  font-weight: 700;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.01em;
`;

export const TitleMonoM = styled(Paragraph)`
  font-family: ${BODY_MONO_FONT_FAMILY};
  font-size: 16px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: -0.01em;
  text-transform: uppercase;
`;
