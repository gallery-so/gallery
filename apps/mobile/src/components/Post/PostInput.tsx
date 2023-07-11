import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import colors from '~/shared/theme/colors';

import { Typography } from '../Typography';

export function PostInput() {
  const [value, setValue] = useState('');

  const { colorScheme } = useColorScheme();

  const isTextTooLong = value.length >= 600;
  const characterCount = value.length;

  const handleChangeText = (newText: string) => {
    if (newText.length <= 600) {
      setValue(newText);
    }
  };

  return (
    <View
      className="relative border bg-offWhite border-porcelain pb-6"
      style={{
        height: 117,
      }}
    >
      <TextInput
        value={value}
        onChangeText={handleChangeText}
        className="px-3 pt-3 text-sm"
        selectionColor={colorScheme === 'dark' ? colors.white : colors.black['800']}
        placeholderTextColor={colorScheme === 'dark' ? colors.metal : colors.shadow}
        multiline
        autoCapitalize="none"
        autoComplete="off"
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
