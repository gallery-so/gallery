import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { useCallback, useRef, useState } from 'react';
import { TextInput, View, ViewProps } from 'react-native';
import { AlertIcon } from 'src/icons/AlertIcon';
import { InfoCircleIcon } from 'src/icons/InfoCircleIcon';

import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';
import { checkValidMintUrl } from '~/shared/utils/getMintUrlWithReferrer';

import { GalleryBottomSheetModalType } from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Toggle } from '../Toggle';
import { Typography } from '../Typography';
import { SupportedMintLinkBottomSheet } from './SupportedMintLinkBottomSheet';

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
  const [includeMintLink, setIncludeMintLink] = useState(true);
  const [mintLink, setMintLink] = useState(defaultValue);

  const { colorScheme } = useColorScheme();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const handleTextChange = useCallback(
    (text: string) => {
      setMintLink(text);

      if (checkValidMintUrl(text)) {
        onSetInvalid(false);
      } else {
        onSetInvalid(true);
      }
    },
    [onSetInvalid]
  );

  const handleToggle = useCallback(() => {
    setIncludeMintLink((prev) => !prev);
  }, []);

  const handleOpenBottomSheet = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  return (
    <View className="space-y-2" style={style}>
      <View className="flex-row items-center justify-between">
        <GalleryTouchableOpacity
          onPress={handleOpenBottomSheet}
          eventElementId="Press Supported Mint Link Bottom Sheet"
          eventName="Press Supported Mint Link Bottom Sheet"
          eventContext={contexts.Posts}
        >
          <View className="flex-row items-center gap-1">
            <Typography
              className="text-lg"
              font={{
                family: 'ABCDiatype',
                weight: 'Bold',
              }}
            >
              Mint link
            </Typography>
            <InfoCircleIcon />
          </View>
        </GalleryTouchableOpacity>

        <Toggle checked={includeMintLink} onToggle={handleToggle} />
      </View>

      {includeMintLink && (
        <View className="space-y-2">
          <TextInput
            value={mintLink}
            defaultValue={defaultValue}
            onChangeText={handleTextChange}
            className={clsx(
              'py-2 px-3 border bg-faint dark:bg-black-900 border-porcelain dark:border-black-500',
              {
                'border-red': invalid,
              }
            )}
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
                  This link isn’t valid. Try a {''}
                  <GalleryTouchableOpacity
                    onPress={handleOpenBottomSheet}
                    eventElementId="Press Supported Mint Link Bottom Sheet"
                    eventName="Press Supported Mint Link Bottom Sheet"
                    eventContext={contexts.Posts}
                    withoutFeedback
                  >
                    <Typography
                      className="text-xs text-red"
                      font={{
                        family: 'ABCDiatype',
                        weight: 'Bold',
                      }}
                    >
                      supported platform.
                    </Typography>
                  </GalleryTouchableOpacity>
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
                  Note: only supported platforms
                </Typography>
              </View>
            ))}
        </View>
      )}

      <SupportedMintLinkBottomSheet ref={bottomSheetRef} />
    </View>
  );
}
