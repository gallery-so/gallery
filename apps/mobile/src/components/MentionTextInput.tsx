import React, { forwardRef } from 'react';
import { TextInput, TextInputProps } from 'react-native';

import { MentionDataType } from '~/shared/hooks/useMentionableMessage';

import ProcessedText from './ProcessedText/ProcessedText';

interface MentionTextInputProps extends TextInputProps {
  style?: TextInputProps['style'];
  mentions: MentionDataType[];
}

const MentionTextInput = forwardRef<TextInput, MentionTextInputProps>((props, ref) => {
  const { value, mentions, ...rest } = props;

  return (
    <TextInput {...rest} ref={ref} multiline numberOfLines={1}>
      <ProcessedText text={value ?? ''} mentionsInText={mentions} />
    </TextInput>
  );
});

export default MentionTextInput;
