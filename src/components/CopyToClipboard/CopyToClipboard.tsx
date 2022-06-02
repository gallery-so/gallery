import { ReactNode, useState, useCallback } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { BaseM } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import { pause } from 'utils/time';

type Props = {
  textToCopy: string;
  children: ReactNode;
};

const SECTION_DURATION_MS = 400;

export default function CopyToClipboard({ textToCopy, children }: Props) {
  // Whether node is actually on the DOM
  const [isToastMounted, setIsToastMounted] = useState(false);
  // Pseudo-state for signaling animations. this will allow us
  // to display an animation prior to unmounting
  const [isActive, setIsActive] = useState(false);

  const handleCopyToClipboard = useCallback(async () => {
    void navigator.clipboard.writeText(textToCopy);
    setIsToastMounted(true);
    setIsActive(true);
    await pause(SECTION_DURATION_MS * 2);
    setIsActive(false);
    await pause(SECTION_DURATION_MS);
    setIsToastMounted(false);
  }, [textToCopy]);

  return (
    <Container onClick={handleCopyToClipboard}>
      {isToastMounted && (
        <Toast isActive={isActive}>
          <BaseM color={colors.white}>Link Copied</BaseM>
        </Toast>
      )}
      {children}
    </Container>
  );
}

const Container = styled.span`
  display: flex;
`;

const translateUpAndFadeIn = keyframes`
    from { opacity: 0; transform: translateY(-14px); };
    to { opacity: 1; transform: translateY(-28px); };
`;

const translateDownAndFadeOut = keyframes`
    from { opacity: 1; transform: translateY(-28px); };
    to { opacity: 0; transform: translateY(-14px); };
`;

const Toast = styled.div<{ isActive: boolean }>`
  position: absolute;
  background: black;
  padding: 4px 8px;
  width: fit-content;
  pointer-events: none;

  animation: ${({ isActive }) => css`
    ${isActive ? translateUpAndFadeIn : translateDownAndFadeOut} ${SECTION_DURATION_MS}ms
  `};
  animation-fill-mode: forwards;
`;
