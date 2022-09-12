import styled from 'styled-components';
import colors from 'components/core/colors';

type Props = {
  onClick: () => void;
  enabled: boolean;
};

export function SendButton({ onClick, enabled }: Props) {
  return (
    <Wrapper>
      <IconCircle enabled={enabled}>
        <SendIcon />
      </IconCircle>
    </Wrapper>
  );
}

const IconCircle = styled.div<{ enabled: boolean }>`
  width: 24px;
  height: 24px;

  border-radius: 99999px;

  background-color: ${({ enabled }) => (enabled ? colors.hyperBlue : colors.metal)};

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_1060_19986)">
        <path d="M14.6667 1.33337L7.33337 8.66671" stroke="#F9F9F9" strokeMiterlimit="10" />
        <path
          d="M14.6667 1.33337L10 14.6667L7.33337 8.66671L1.33337 6.00004L14.6667 1.33337Z"
          stroke="#F9F9F9"
          strokeMiterlimit="10"
        />
      </g>
      <defs>
        <clipPath id="clip0_1060_19986">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
