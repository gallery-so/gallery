import styled from 'styled-components';
import { BODY_FONT_FAMILY, Paragraph, TITLE_FONT_FAMILY } from 'components/core/Text/Text';
import colors from 'components/core/colors';

export const HomeText = styled(Paragraph)`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 18px;
  font-weight: 500;
  line-height: 21px;

  letter-spacing: -0.04em;
`;

export const BreadcrumbText = styled(Paragraph)`
  font-family: ${TITLE_FONT_FAMILY};
  font-size: 18px;
  font-weight: 400;
  line-height: 21px;

  text-align: center;

  letter-spacing: -0.04em;

  color: ${colors.offBlack};
`;
