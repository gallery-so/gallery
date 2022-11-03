import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/components/core/colors';
import { BODY_FONT_FAMILY, Paragraph, TITLE_FONT_FAMILY } from '~/components/core/Text/Text';

export const HomeText = styled(Paragraph)`
  font-family: ${BODY_FONT_FAMILY};
  font-weight: 500;
  line-height: 21px;

  letter-spacing: -0.04em;

  font-size: 16px;
  @media only screen and ${breakpoints.tablet} {
    font-size: 18px;
  }
`;

export const BreadcrumbText = styled(Paragraph)`
  font-family: ${TITLE_FONT_FAMILY};
  font-weight: 400;
  line-height: 21px;
  color: ${colors.offBlack};
  text-align: center;
  letter-spacing: -0.04em;

  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  font-size: 16px;
  @media only screen and ${breakpoints.tablet} {
    font-size: 18px;
  }
`;

export const BreadcrumbLink = styled.a`
  font-family: ${TITLE_FONT_FAMILY};
  font-weight: 400;
  line-height: 21px;
  text-decoration: none;
  text-align: center;
  letter-spacing: -0.04em;
  color: ${colors.offBlack};

  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  font-size: 16px;
  @media only screen and ${breakpoints.tablet} {
    font-size: 18px;
  }
`;
