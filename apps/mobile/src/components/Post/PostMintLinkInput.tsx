import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { useCallback, useState } from 'react';
import { TextInput, View, ViewProps } from 'react-native';
import { AlertIcon } from 'src/icons/AlertIcon';
import { InfoCircleIcon } from 'src/icons/InfoCircleIcon';

import colors from '~/shared/theme/colors';

import { Toggle } from '../Toggle';
import { Typography } from '../Typography';

type Props = {
  defaultValue?: string;
  style?: ViewProps['style'];

  invalid: boolean;
  onSetInvalid: (invalid: boolean) => void;

  isFocused: boolean;
  onSetIsFocused: (isFocused: boolean) => void;
};

export function PostMintLinkInput({
  defaultValue,
  invalid,
  onSetInvalid,
  isFocused,
  onSetIsFocused,

  style,
}: Props) {
  const [includeMintLink, setIncludeMintLink] = useState(false);
  const [mintLink, setMintLink] = useState(defaultValue);

  const { colorScheme } = useColorScheme();

  const handleTextChange = useCallback(
    (text: string) => {
      setMintLink(text);

      // Make sure the link is consists of either https://mint.fun/ or https://zora.co
      const mintFunRegex = new RegExp('https://mint.fun/');
      const zoraRegex = new RegExp('https://zora.co/');

      if (mintFunRegex.test(text) || zoraRegex.test(text)) {
        onSetInvalid(false);
      } else {
        onSetInvalid(true);
      }
    },
    [onSetInvalid]
  );

  const handleToggle = useCallback((checked: boolean) => {
    setIncludeMintLink(checked);
  }, []);

  return (
    <View className="space-y-2" style={style}>
      <View className="flex-row items-center justify-between">
        <Typography
          className="text-lg"
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
        >
          Mint link
        </Typography>
        <Toggle checked={includeMintLink} onChange={handleToggle} />
      </View>

      {includeMintLink && (
        <View className="space-y-2">
          <TextInput
            value={mintLink}
            defaultValue={defaultValue}
            onChangeText={handleTextChange}
            className={clsx('py-2 px-3 border bg-faint border-porcelain', {
              'border-red': invalid,
            })}
            selectionColor={colorScheme === 'dark' ? colors.white : colors.black['800']}
            placeholderTextColor={colorScheme === 'dark' ? colors.metal : colors.shadow}
            autoCapitalize="none"
            autoComplete="off"
            keyboardAppearance={colorScheme}
            onFocus={() => onSetIsFocused(true)}
            onBlur={() => onSetIsFocused(false)}
            style={{
              color: invalid
                ? colors.red
                : colorScheme === 'dark'
                ? colors.white
                : colors.black['800'],
            }}
          />

          {isFocused &&
            (invalid ? (
              <View className="flex-row items-center space-x-1">
                <AlertIcon />
                <Typography
                  className="text-xs text-red"
                  font={{
                    family: 'ABCDiatype',
                    weight: 'Regular',
                  }}
                >
                  Invalid link. Only Mint.fun or Zora are currently supported
                </Typography>
              </View>
            ) : (
              <View className="flex-row items-center space-x-1">
                <InfoCircleIcon />
                <Typography
                  className="text-xs text-metal"
                  font={{
                    family: 'ABCDiatype',
                    weight: 'Regular',
                  }}
                >
                  Note: only Mint.fun or Zora are currently supported
                </Typography>
              </View>
            ))}
        </View>
      )}
    </View>
  );
}
