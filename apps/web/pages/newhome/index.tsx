import Image from 'next/image';
import frame from 'public/frame.jpg';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import colors from '~/shared/theme/colors';

const TOP_SECRET_PASSWORD = 'koalasruletheworld';

export default function NewHome() {
  const [password, setPassword] = useState('');

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  }, []);

  const revealTypeform = useCallback(() => {}, []);

  useEffect(() => {
    if (password === TOP_SECRET_PASSWORD) {
      revealTypeform();
    }
  }, [password, revealTypeform]);

  return (
    <NewHomeContainer>
      <ContentContainer>
        <StyledImage
          src={frame}
          alt="frame"
          // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <StyledInnerContent justify="center" align="center" gap={50}>
          <TextContainer>
            <IntroText>A new home</IntroText>
            <IntroText>
              <i>awaits...</i>
            </IntroText>
          </TextContainer>
          <PasswordInput
            placeholder="enter password"
            autoFocus
            type="password"
            onChange={handleChange}
          />
        </StyledInnerContent>
      </ContentContainer>
    </NewHomeContainer>
  );
}

const NewHomeContainer = styled.div`
  width: 100vw;
  height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContentContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;
`;

const StyledImage = styled(Image)`
  width: 500px;
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

  width: 118px;

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

const IntroText = styled.span`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 50px;
  line-height: 48px;
  letter-spacing: -0.05em;
`;
