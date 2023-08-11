import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { useMemo } from 'react';
import { TextInput, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { PostInputTokenFragment$key } from '~/generated/PostInputTokenFragment.graphql';
import colors from '~/shared/theme/colors';

import { Typography } from '../Typography';
const MAX_LENGTH = 600;

type Props = {
  value: string;
  onChange: (newText: string) => void;
  tokenRef: PostInputTokenFragment$key;
};

export function PostInput({ value, onChange, tokenRef }: Props) {
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
      className="relative border bg-offWhite dark:bg-black-900 border-porcelain dark:border-black-500 pb-10"
      style={{
        height: 117,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChange}
        className="px-3 pt-3 text-sm"
        selectionColor={colorScheme === 'dark' ? colors.white : colors.black['800']}
        placeholderTextColor={colorScheme === 'dark' ? colors.metal : colors.shadow}
        multiline
        autoFocus
        maxLength={MAX_LENGTH}
        autoCapitalize="none"
        autoComplete="off"
        keyboardAppearance={colorScheme}
        placeholder={inputPlaceHolder}
        style={{ flex: 1, color: colorScheme === 'dark' ? colors.white : colors.black['800'] }}
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
