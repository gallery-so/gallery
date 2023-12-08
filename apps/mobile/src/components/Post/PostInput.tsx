import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { useMemo } from 'react';
import { NativeSyntheticEvent, TextInputSelectionChangeEventData, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { PostInputTokenFragment$key } from '~/generated/PostInputTokenFragment.graphql';
import { MentionDataType } from '~/shared/hooks/useMentionableMessage';
import colors from '~/shared/theme/colors';

import MentionTextInput from '../MentionTextInput';
import { Typography } from '../Typography';
const MAX_LENGTH = 600;

type Props = {
  value: string;
  onChange: (newText: string) => void;
  tokenRef: PostInputTokenFragment$key;
  mentions: MentionDataType[];
  onSelectionChange: (selection: { start: number; end: number }) => void;
};

export function PostInput({ value, onChange, tokenRef, mentions, onSelectionChange }: Props) {
  const token = useFragment(
    graphql`
      fragment PostInputTokenFragment on Token {
        name
      }
    `,
    tokenRef
  );

  const { colorScheme } = useColorScheme();

  const isTextTooLong = value.length >= MAX_LENGTH;
  const characterCount = value.length;

  const inputPlaceHolder = useMemo(() => {
    return `Say something about "${token.name ?? 'this item'}"`;
  }, [token.name]);

  return (
    <View
      className="relative border bg-faint dark:bg-black-900 border-porcelain dark:border-black-500 pb-10"
      style={{
        height: 117,
      }}
    >
      <MentionTextInput
        value={value}
        onChangeText={onChange}
        className="px-3 pt-3 text-sm"
        selectionColor={colorScheme === 'dark' ? colors.white : colors.black['800']}
        placeholderTextColor={colorScheme === 'dark' ? colors.metal : colors.shadow}
        multiline
        onSelectionChange={(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
          onSelectionChange(e.nativeEvent.selection);
        }}
        maxLength={MAX_LENGTH}
        autoCapitalize="none"
        autoComplete="off"
        keyboardAppearance={colorScheme}
        placeholder={inputPlaceHolder}
        style={{
          flex: 1,
          color: colorScheme === 'dark' ? colors.white : colors.black['800'],
        }}
        mentions={mentions}
      />

      {isTextTooLong && (
        <Typography
          className="text-sm text-red absolute bottom-2 left-2"
          font={{
            family: 'ABCDiatype',
            weight: 'Medium',
          }}
        >
          Your text is too long
        </Typography>
      )}
      {value.length > 0 && (
        <Typography
          className={clsx(
            'text-sm absolute bottom-3 right-3',
            isTextTooLong ? 'text-red' : 'text-metal'
          )}
          font={{
            family: 'ABCDiatype',
            weight: isTextTooLong ? 'Medium' : 'Regular',
          }}
        >
          {characterCount}/600
        </Typography>
      )}
    </View>
  );
}
