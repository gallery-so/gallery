import styled from 'styled-components';

import colors from '~/components/core/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseXL, BODY_MONO_FONT_FAMILY, TitleDiatypeL } from '~/components/core/Text/Text';

export type LogType = {
  action: {
    tool: string;
    toolInput: string;
    log: string;
  };
  observation: string;
};

type Props = {
  logs: LogType[];
};

export default function BrainModal({ logs }: Props) {
  return (
    <StyledLogModal>
      <StyledBodyTextContainer>
        <TitleDiatypeL
          style={{
            fontSize: 24,
          }}
        >
          Logs
        </TitleDiatypeL>
      </StyledBodyTextContainer>
      <VStack gap={24}>
        {logs.map((log, index) => (
          <VStack key={index} gap={16}>
            <VStack gap={8}>
              <HStack gap={4}>
                <StyledCircle>
                  <BaseXL>{index + 1}</BaseXL>
                </StyledCircle>
                <BaseXL
                  style={{
                    fontWeight: 700,
                  }}
                >
                  {log.action.tool}
                </BaseXL>
              </HStack>
              <BaseXL>{log.action.log}</BaseXL>
            </VStack>
            <StyledQuery>{log.observation}</StyledQuery>
          </VStack>
        ))}
      </VStack>
    </StyledLogModal>
  );
}

const StyledLogModal = styled(VStack)`
  width: 480px;
  min-height: 250px;
`;

const StyledBodyTextContainer = styled.div`
  padding: 16px 0 32px;
`;

const StyledQuery = styled.p`
  font-family: ${BODY_MONO_FONT_FAMILY};
`;

const StyledCircle = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${colors.activeBlue};
  text-align: center;
  margin-right: 8px;

  ${BaseXL} {
    color: ${colors.white};
  }
`;
