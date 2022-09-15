import useTimer from 'hooks/useTimer';
import { ALLOWLIST_MINTING_TIME, GALLERY_MINTING_TIME, PUBLIC_MINTING_TIME } from './times';
import { useState, useEffect } from 'react';
import { BaseS, BaseM, TitleM } from 'components/core/Text/Text';
import styled from 'styled-components';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import colors from 'components/core/colors';
import { Spacer, VStack } from 'components/core/Spacer/Stack';

export default function Countdown() {
  const [nextTime, setNextTime] = useState('');
  const [text, setText] = useState('');
  const [showCounter, setShowCounter] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentTime < new Date(ALLOWLIST_MINTING_TIME)) {
      setNextTime(ALLOWLIST_MINTING_TIME);
      setText('Shop opens for Premium Members in');
    } else if (currentTime < new Date(GALLERY_MINTING_TIME)) {
      setNextTime(GALLERY_MINTING_TIME);
      setText('Shop is currently open for Premium Members.\nOpening for all Gallery Members in');
    } else if (currentTime < new Date(PUBLIC_MINTING_TIME)) {
      setNextTime(PUBLIC_MINTING_TIME);
      setText('Shop is currently open for all Gallery Members.\nOpening to the general public in');
    } else {
      setShowCounter(false);
    }
  }, [currentTime]);

  const { hours, minutes, seconds } = useTimer(nextTime);

  return (
    <>
      {showCounter && (
        <StyledContainer gap={32}>
          <VStack gap={12}>
            {text.split('\n').map((d, i) => (
              <BaseM key={i}>{d}</BaseM>
            ))}
            <StyledCountdown>
              <StyledCountdownText>
                <StyledNumber>{hours === 'NaN' ? ' ' : hours}</StyledNumber>
                <StyledCountdownLabel>{hours === '1' ? 'hr' : 'hrs'}</StyledCountdownLabel>
              </StyledCountdownText>
              <StyledCountdownText>
                <StyledNumber>{minutes === 'NaN' ? ' ' : minutes}</StyledNumber>
                <StyledCountdownLabel>{minutes === '1' ? 'min' : 'mins'}</StyledCountdownLabel>
              </StyledCountdownText>
              <StyledCountdownText>
                <StyledNumber>{seconds === 'NaN' ? ' ' : seconds}</StyledNumber>
                <StyledCountdownLabel>{seconds === '1' ? 'sec' : 'secs'}</StyledCountdownLabel>
              </StyledCountdownText>
            </StyledCountdown>
            <StyledInteractiveLink href="https://gallery.mirror.xyz/Yw-Stzpz0PTtrPMw-P-XKnSQn8eDC1o_WnP-c19r8V0#drop-schedule">
              See mint schedule
            </StyledInteractiveLink>
          </VStack>
          <Spacer />
        </StyledContainer>
      )}
    </>
  );
}

const StyledContainer = styled(VStack)`
  align-items: center;
  justify-content: center;

  // This ensures that the countdown is visible on mobile, but when it goes away at public mint, the page still has proper margins around the header
  @media screen and (max-width: 768px) {
    margin-top: 60px;
    margin-bottom: calc(-60px + 24px);
  }
`;

const StyledCountdown = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  column-gap: 16px;
`;

const StyledCountdownText = styled.div`
  min-width: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// We provide a height so that the numbers don't jump around before they have loaded in (takes 1 second);
const StyledNumber = styled(TitleM)`
  height: 28px;
`;

const StyledCountdownLabel = styled(BaseS)`
  font-style: normal;
`;

const StyledInteractiveLink = styled(InteractiveLink)`
  color: ${colors.metal};
`;
