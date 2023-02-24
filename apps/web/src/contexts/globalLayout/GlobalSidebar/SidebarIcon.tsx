import styled from 'styled-components';
import colors from '~/components/core/colors';
import IconContainer from '~/components/core/IconContainer';
import transitions from '~/components/core/transitions';
import { NewTooltip } from '~/components/Tooltip/NewTooltip';
import { useTooltipHover } from '~/components/Tooltip/useTooltipHover';

type Props = {
  onClick: () => void;
  icon: React.ReactElement;
  isActive?: boolean;
  tooltipLabel: string;
};
export default function SidebarIcon({ onClick, icon, isActive = false, tooltipLabel }: Props) {
  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover();

  return (
    <IconWrapper>
      <StyledIconContainer
        ref={reference}
        variant="default"
        onClick={onClick}
        icon={icon}
        isActive={isActive}
      />
      <NewTooltip
        {...getFloatingProps()}
        style={floatingStyle}
        ref={floating}
        text={tooltipLabel}
      />
    </IconWrapper>
  );
}

const StyledIconContainer = styled(IconContainer)<{ isActive: boolean }>`
  ${({ isActive }) => isActive && `border: 1px solid ${colors.offBlack}`};
`;

const IconWrapper = styled.div`
  &:hover {
  }
`;
