import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NotificationBoxFragment$key } from '__generated__/NotificationBoxFragment.graphql';
import styled, { css, keyframes } from 'styled-components';
import { BaseM } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import { useCallback, useEffect, useState } from 'react';
import { NotificationDropdown } from 'components/NotificationBox/NotificationDropdown';

type NotificationBoxProps = {
  queryRef: NotificationBoxFragment$key;
};

export function NotificationBox({ queryRef }: NotificationBoxProps) {
  const query = useFragment(
    graphql`
      fragment NotificationBoxFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }

        ...NotificationDropdownFragment
      }
    `,
    queryRef
  );

  const [count, setCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCountClick = useCallback(() => {
    setIsDropdownOpen((previous) => !previous);
  }, []);

  return (
    <Container>
      <CountContainer role="button" onClick={handleCountClick}>
        <CountText>{count}</CountText>
      </CountContainer>

      <DropdownContainer open={isDropdownOpen}>
        <NotificationDropdown queryRef={query} />
      </DropdownContainer>
    </Container>
  );
}

const DropdownContainer = styled.div<{ open: boolean }>`
  position: absolute;

  right: 0;
  bottom: 0;
  top: 100%;

  transition: transform 300ms ease-out, opacity 300ms ease-out;

  ${({ open }) =>
    open
      ? css`
          transform: translateY(8px);
          opacity: 1;
        `
      : css`
          transform: translateY(4px);
          opacity: 0;
        `}
`;

const Container = styled.div`
  position: relative;
`;

const CountContainer = styled.div`
  width: 32px;
  height: 32px;

  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;

  :hover {
    background-color: ${colors.faint};
  }
`;

const CountText = styled(BaseM)`
  color: ${colors.metal};
  background-color: ${colors.faint};

  font-variant-numeric: tabular-nums;
  padding: 4px 6px;
  line-height: 1;

  user-select: none;

  border-radius: 99999px;
`;
