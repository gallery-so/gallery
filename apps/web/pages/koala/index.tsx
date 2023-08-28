import { Widget } from '@typeform/embed-react';
import Image from 'next/image';
import frame from 'public/frame.jpg';
import { useCallback, useEffect, useState } from 'react';
import Div100vh from 'react-div-100vh';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import colors from '~/shared/theme/colors';

const TOP_SECRET_PASSWORD = 'koalasruletheworld';

export default function NewHome() {
  const [password, setPassword] = useState('');

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  }, []);

  const [view, setView] = useState<'default' | 'typeform'>('default');

  useEffect(() => {
    if (password === TOP_SECRET_PASSWORD) {
      setView('typeform');
    }
  }, [password]);

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    // using this library hack to ensure 100vh isn't buggy on mobile
    // https://github.com/mvasin/react-div-100vh
    <Div100vh>
      <NewHomeContainer>
        <IntroContentContainer opacity={Number(view === 'default')}>
          <StyledImage src={frame} alt="frame" isMobile={isMobile} />
          <StyledInnerContent justify="center" align="center" gap={isMobile ? 30 : 50}>
            <TextContainer>
              <IntroText isMobile={isMobile}>A new home</IntroText>
              <IntroText isMobile={isMobile}>
                <i>awaits...</i>
              </IntroText>
            </TextContainer>
            <PasswordInput
              autoFocus
              type="password"
              placeholder="enter password"
              onChange={handleChange}
            />
          </StyledInnerContent>
        </IntroContentContainer>
        <TypeformContentContainer opacity={Number(view === 'typeform')}>
          <TypeformView />
        </TypeformContentContainer>
      </NewHomeContainer>
    </Div100vh>
  );
}

const NewHomeContainer = styled.div`
  width: 100vw;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const IntroContentContainer = styled.div<{ opacity: number }>`
  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;

  opacity: ${({ opacity }) => opacity};
  pointer-events: ${({ opacity }) => (!opacity ? 'none' : 'auto')};
  transition: opacity 600ms cubic-bezier(0.4, 0, 0.6, 1);
`;

const TypeformContentContainer = styled.div<{ opacity: number }>`
  position: absolute;
  width: 100%;
  height: 100%;

  opacity: ${({ opacity }) => opacity};
  pointer-events: ${({ opacity }) => (!opacity ? 'none' : 'auto')};
  transition: opacity 600ms cubic-bezier(0.4, 0, 0.6, 1);
`;

const StyledImage = styled(Image)<{ isMobile: boolean }>`
  width: ${({ isMobile }) => (isMobile ? 380 : 500)}px;
  height: auto;
  position: absolute;
`;

const StyledInnerContent = styled(VStack)`
  position: absolute;
  width: 300px;
  text-align: center;
`;

const PasswordInput = styled.input`
  border: none;
  width: 120px;
  &::placeholder {
    color: ${colors.metal};
    font-family: ${BODY_FONT_FAMILY};
    font-size: 16px;
  }
`;

const TextContainer = styled(VStack)`
  width: 100%;
  padding-top: 60px;
`;

const IntroText = styled.span<{ isMobile: boolean }>`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: ${({ isMobile }) => (isMobile ? 32 : 50)}px;
  line-height: ${({ isMobile }) => (isMobile ? 36 : 48)}px;
  letter-spacing: -0.05em;
`;

function TypeformView() {
  return <Widget id="GcDBLwvj" style={{ width: '100%', height: '100%' }} />;
}
