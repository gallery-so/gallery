import { Route } from 'nextjs-routes';
import { MouseEventHandler, ReactNode, useCallback } from 'react';
import styled from 'styled-components';

import { TrashIconNew } from '~/icons/TrashIconNew';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';

import GalleryLink from '../GalleryLink/GalleryLink';
import { HStack } from '../Spacer/Stack';
import { BaseM } from '../Text/Text';
import { DropdownEventProps } from './DropdownItem';

type DropdownLinkProps = {
  href: Route;
  children?: ReactNode;
  onClick?: () => void;
} & DropdownEventProps;

export function DropdownLink({
  href,
  children,
  onClick,
  label,
  variant = 'default',
  name,
  eventContext,
  eventFlow,
  eventSelection,
  properties,
}: DropdownLinkProps) {
  const track = useTrack();

  const handleClick = useCallback<MouseEventHandler<HTMLAnchorElement>>(
    (event) => {
      event.stopPropagation();

      track('Dropdown Item Click', {
        id: `${name} Dropdown Item`,
        name: `${name} Dropdown Item Click`,
        context: eventContext,
        flow: eventFlow,
        selection: eventSelection,
        ...properties,
      });

      onClick?.();
    },
    [track, name, eventContext, eventFlow, eventSelection, properties, onClick]
  );

  if (label) {
    return (
      <StyledGalleryLink onClick={handleClick}>
        <HStack gap={4} align="center">
          {variant === 'delete' ? <TrashIconNew color={colors.error} /> : null}
          <BaseM color={variant === 'delete' ? colors.error : undefined}>{label}</BaseM>
        </HStack>
      </StyledGalleryLink>
    );
  }

  return (
    <StyledGalleryLink to={href} onClick={handleClick}>
      {children}
    </StyledGalleryLink>
  );
}

const StyledGalleryLink = styled(GalleryLink)`
  padding: 8px;

  font-family: 'Helvetica Neue';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;

  color: #808080;
  cursor: pointer;
  text-decoration: none;

  white-space: nowrap;

  :hover {
    color: ${colors.black['800']};
    background-color: ${colors.faint};
  }
`;
