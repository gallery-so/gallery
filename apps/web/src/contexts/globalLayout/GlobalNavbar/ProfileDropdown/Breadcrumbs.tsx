import styled from 'styled-components';

import { Paragraph, TITLE_FONT_FAMILY } from '~/components/core/Text/Text';
import colors from '~/shared/theme/colors';

export const BreadcrumbText = styled(Paragraph)`
  display: inline;
  font-family: ${TITLE_FONT_FAMILY};
  font-weight: 400;
  line-height: 21px;
  color: ${colors.black['800']};
  text-align: center;
  letter-spacing: -0.04em;

  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  font-size: 18px;
  cursor: pointer;
`;

export const BreadcrumbLink = styled.span`
  font-family: ${TITLE_FONT_FAMILY};
  font-weight: 400;
  line-height: 21px;
  text-decoration: none;
  text-align: center;
  letter-spacing: -0.04em;
  color: ${colors.black['800']};

  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  font-size: 18px;
`;
