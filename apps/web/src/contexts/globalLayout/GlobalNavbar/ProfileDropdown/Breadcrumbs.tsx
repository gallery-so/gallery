import styled from 'styled-components';

import colors from '~/shared/theme/colors';
import { Paragraph, TITLE_FONT_FAMILY } from '~/components/core/Text/Text';

export const BreadcrumbText = styled(Paragraph)`
  display: inline;
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

  font-size: 18px;
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

  font-size: 18px;
`;
