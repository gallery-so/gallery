import styled from 'styled-components';
import breakpoints from '../breakpoints';
import colors from '../colors';

const TITLE_FONT_FAMILY = 'GT Alpina';
const BODY_FONT_FAMILY = 'ABC Diatype';

type TextProps = {
  color?: colors;
  caps?: boolean;
};

const H1 = styled.h1<TextProps>`
  margin: 0;
  color: ${({ color }) => (color ? color : colors.black)};
  text-transform: ${({ caps }) => (caps ? 'uppercase' : undefined)};
`;

const H2 = styled.h2<TextProps>`
  margin: 0;
  color: ${({ color }) => (color ? color : colors.black)};
  text-transform: ${({ caps }) => (caps ? 'uppercase' : undefined)};
`;

const H3 = styled.h3<TextProps>`
  margin: 0;
  color: ${({ color }) => (color ? color : colors.black)};
  text-transform: ${({ caps }) => (caps ? 'uppercase' : undefined)};
`;

const Paragraph = styled.p<TextProps>`
  margin: 0;
  color: ${({ color }) => (color ? color : colors.black)};
  text-transform: ${({ caps }) => (caps ? 'uppercase' : undefined)};
`;

export const TitleL = styled(H1)`
  font-family: ${TITLE_FONT_FAMILY};
  font-size: 32;
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
  letter-spacing: -0.05em;

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

export const TitleXS = styled(H3)`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  text-transform: uppercase;
`;

export const Subdisplay = styled(H2)`
  font-family: ${TITLE_FONT_FAMILY};
  font-size: 32px;
  font-weight: 400;
  line-height: 44px;
  letter-spacing: 0px;

  @media only screen and ${breakpoints.tablet} {
    font-size: 48px;
    line-height: 48px;
  }
`;

export const Heading = styled(H3)`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 20px;
  font-weight: 400;
  line-height: 28px;
  letter-spacing: 0px;
`;

const _TitleBase = styled(Paragraph)`
  font-size: 18px;
  line-height: 24px;
`;

export const TitleSerif = styled(_TitleBase)`
  font-family: ${TITLE_FONT_FAMILY};
`;

export const TitleRegular = styled(_TitleBase)`
  font-family: ${BODY_FONT_FAMILY};
`;

export const TitleMedium = styled(TitleRegular)`
  font-weight: 500;
  font-size: 18px;
`;

export const BaseXL = styled(Paragraph)`
  font-family: ${BODY_FONT_FAMILY};
  font-weight: 400;
  font-size: 18px;
  line-height: 24px;
`;

// Base M
export const BodyRegular = styled(Paragraph)`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 14px;
  line-height: 20px;
  // letter-spacing: 0.4px;
`;

export const BodyMedium = styled(BodyRegular)`
  font-weight: 500;
`;

export const ButtonText = styled(Paragraph)`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0px;
`;

export const Caption = styled(Paragraph)`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.4px;
`;
