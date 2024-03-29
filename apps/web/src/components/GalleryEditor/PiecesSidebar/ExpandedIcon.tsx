import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';

type Props = { expanded: boolean };

export function ExpandedIcon({ expanded }: Props) {
  return (
    <Container>
      <IconContainer
        variant="stacked"
        size="sm"
        icon={
          <StyledSvg
            expanded={expanded}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.3335 6.00012L8.00016 10.6668L12.6668 6.00012"
              stroke="currentColor"
              strokeMiterlimit="10"
            />
          </StyledSvg>
        }
      />
    </Container>
  );
}

const StyledSvg = styled.svg<{ expanded: boolean }>`
  transform: rotate(${({ expanded }) => (expanded ? '0' : '180')}deg);
  transform-origin: center;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
`;
