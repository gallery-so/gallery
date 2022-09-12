import styled from 'styled-components';
import colors from 'components/core/colors';
import { useCallback, MouseEventHandler, useState, useRef } from 'react';
import { SendButton } from 'components/Feed/Socialize/SendButton';
import { BaseM, BODY_FONT_FAMILY } from 'components/core/Text/Text';
import { HStack } from 'components/core/Spacer/Stack';

const MAX_TEXT_LENGTH = 100;

export function CommentBox() {
  const [value, setValue] = useState('');

  const handleClick = useCallback<MouseEventHandler<HTMLElement>>((event) => {
    event.stopPropagation();
  }, []);

  const textareaRef = useRef<HTMLParagraphElement | null>(null);

  return (
    <Wrapper onClick={handleClick}>
      <InputWrapper gap={12}>
        {/* Purposely not using a controlled input here to avoid cursor jitter */}
        <Textarea
          ref={textareaRef}
          onInput={(event) => {
            const nextValue = event.currentTarget.textContent ?? '';

            if (nextValue.length > MAX_TEXT_LENGTH) {
              event.currentTarget.textContent = nextValue.slice(0, 100);

              const range = document.createRange();
              const selection = window.getSelection();

              if (!selection) {
                return;
              }

              range.setStart(event.currentTarget.childNodes[0], 100);
              range.setEnd(event.currentTarget.childNodes[0], 100);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            } else {
              setValue(nextValue);
            }
          }}
        />

        <ControlsContainer gap={12} align="center">
          <BaseM color={colors.metal}>{MAX_TEXT_LENGTH - value.length}</BaseM>
          <SendButton enabled={value.length > 0} onClick={() => {}} />
        </ControlsContainer>
      </InputWrapper>
    </Wrapper>
  );
}

const ControlsContainer = styled(HStack)`
  padding: 4px 0;
`;

const InputWrapper = styled(HStack)`
  width: 100%;
  height: 100%;
  background-color: ${colors.faint};

  padding: 0 8px;

  position: relative;
`;

const Textarea = styled(BaseM).attrs({
  role: 'textbox',
  contentEditable: 'true',
})`
  min-width: 0;
  font-family: ${BODY_FONT_FAMILY};

  width: 100%;
  min-height: 20px;

  resize: both;

  color: ${colors.metal};

  padding: 6px 0;

  :focus {
    outline: none;
    color: ${colors.offBlack};
  }
`;

const Wrapper = styled.div`
  width: 375px;

  border: 1px solid ${colors.offBlack};

  background: ${colors.white};

  padding: 8px;
`;
