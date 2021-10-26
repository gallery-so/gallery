import styled from 'styled-components';
import breakpoints from '../breakpoints';
import colors from '../colors';

const TITLE_FONT_FAMILY = 'Gallery Display';
const BODY_FONT_FAMILY = 'Helvetica Neue';

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

export const Display = styled(H1)`
  font-family: ${TITLE_FONT_FAMILY};
  font-size: 48px;
  font-weight: 400;
  line-height: 56px;
  letter-spacing: 0px;
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

export const BodyRegular = styled(Paragraph)`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.4px;
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
