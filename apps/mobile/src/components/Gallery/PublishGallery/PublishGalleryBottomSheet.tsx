import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, View } from 'react-native';
import { contexts } from 'shared/analytics/constants';
import colors from 'shared/theme/colors';

import { Button } from '~/components/Button';
import { Typography } from '~/components/Typography';
import { useToastActions } from '~/contexts/ToastContext';

type Props = {
  onPublish: () => void;
};

export function PublishGalleryBottomSheet({ onPublish }: Props) {
  const { colorScheme } = useColorScheme();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { pushToast } = useToastActions();

  const handlePostAndPublish = useCallback(() => {
    // handle post and publish
    pushToast({
      message: 'Feature in progress',
    });
  }, [pushToast]);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{
        backgroundColor: colorScheme === 'dark' ? colors.black['900'] : colors.white,
      }}
    >
      <View className="flex flex-col space-y-6">
        <View className="flex flex-col space-y-6">
          <Typography
            className="text-lg text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            Publish
          </Typography>
          <Typography
            className="text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            Share your Gallery in a post to showcase your collection to collectors and creators.
          </Typography>

          <View
            className={clsx(
              'relative border bg-faint dark:bg-black-900 p-3',
              isInputFocused
                ? 'border-porcelain dark:border-black-500'
                : 'border-transparent dark:border-transparent'
            )}
            style={{
              minHeight: 117,
              height: 'auto',
            }}
          >
            <BottomSheetTextInput
              className="p-3 text-sm"
              selectionColor={colorScheme === 'dark' ? colors.white : colors.black['800']}
              placeholderTextColor={colorScheme === 'dark' ? colors.metal : colors.shadow}
              multiline
              style={{
                color: colorScheme === 'dark' ? colors.white : colors.black['800'],
              }}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="Add an optional caption"
            />
          </View>
        </View>

        <View className="space-y-2">
          <Button
            onPress={handlePostAndPublish}
            text="Post + publish"
            eventElementId="Post and Publish Gallery Button"
            eventName="Post and Publish Gallery"
            eventContext={contexts.UserGallery}
          />
          <Button
            onPress={onPublish}
            variant="secondary"
            text="just publish"
            eventElementId="Publish Gallery Button"
            eventName="Publish Gallery"
            eventContext={contexts.UserGallery}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
