import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { useMemo, useState } from 'react';
import { NativeSyntheticEvent, TextInputSelectionChangeEventData, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import { graphql, useFragment } from 'react-relay';
import { MAX_POST_LENGTH } from 'shared/utils/getRemaningCharacterCount';

import { PostInputTokenFragment$key } from '~/generated/PostInputTokenFragment.graphql';
import { MentionDataType } from '~/shared/hooks/useMentionableMessage';
import colors from '~/shared/theme/colors';

import MentionTextInput from '../MentionTextInput';
import { Typography } from '../Typography';

type Props = {
  value: string;
  onChange: (newText: string) => void;
  tokenRef: PostInputTokenFragment$key;
  mentions: MentionDataType[];
  onSelectionChange: (selection: { start: number; end: number }) => void;
};

const transitionFadeIn = FadeIn.duration(300).easing(Easing.ease);
const transitionFadeOut = FadeOut.duration(300).easing(Easing.ease);

export function PostInput({ value, onChange, tokenRef, mentions, onSelectionChange }: Props) {
  const token = useFragment(
    graphql`
      fragment PostInputTokenFragment on Token {
        definition {
          name
        }
      }
    `,
    tokenRef
  );

  const { colorScheme } = useColorScheme();

  const isTextTooLong = value.length >= MAX_POST_LENGTH;

  const inputPlaceHolder = useMemo(() => {
    return `Say something about "${token.definition?.name ?? 'this item'}"`;
  }, [token.definition?.name]);

  const [isInputFocused, setIsInputFocused] = useState(false);

  return (
    <View className="space-y-2">
      <View
        className={clsx(
          'relative border bg-faint dark:bg-black-900 ',
          isInputFocused
            ? 'border-porcelain dark:border-black-500'
            : 'border-transparent dark:border-transparent'
        )}
        style={{
          minHeight: 117,
          height: 'auto',
        }}
      >
        <MentionTextInput
          value={value}
          onChangeText={onChange}
          className="p-3 text-sm"
          selectionColor={colorScheme === 'dark' ? colors.white : colors.black['800']}
          placeholderTextColor={colorScheme === 'dark' ? colors.metal : colors.shadow}
          multiline
          onSelectionChange={(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
            onSelectionChange(e.nativeEvent.selection);
          }}
          maxLength={MAX_POST_LENGTH}
          autoCapitalize="none"
          autoComplete="off"
          keyboardAppearance={colorScheme}
          placeholder={inputPlaceHolder}
          style={{
            color: colorScheme === 'dark' ? colors.white : colors.black['800'],
          }}
          mentions={mentions}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
        />
      </View>
      <View className="flex-row items-center justify-between">
        {isTextTooLong ? (
          <Animated.View entering={transitionFadeIn} exiting={transitionFadeOut}>
            <Typography
              className="text-sm text-red"
              font={{
                family: 'ABCDiatype',
                weight: 'Medium',
              }}
            >
              Max text level reached
            </Typography>
          </Animated.View>
        ) : (
          <View />
        )}
        {value.length > MAX_POST_LENGTH - 100 && (
          <Animated.View entering={transitionFadeIn} exiting={transitionFadeOut}>
            <Typography
              className={clsx('text-sm', isTextTooLong ? 'text-red' : 'text-metal')}
              font={{
                family: 'ABCDiatype',
                weight: isTextTooLong ? 'Medium' : 'Regular',
              }}
            >
              {value.length}/600
            </Typography>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
