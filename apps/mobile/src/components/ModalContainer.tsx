import { useNavigation } from '@react-navigation/native';
import { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconContainer } from '~/components/IconContainer';

import { XMarkIcon } from '../icons/XMarkIcon';

type Props = PropsWithChildren<{
  scrollable?: boolean;
  withBackButton?: boolean;
}>;

export function ModalContainer({ children, scrollable = false, withBackButton = false }: Props) {
  const { bottom } = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View
      className="flex h-full flex-col bg-white dark:bg-black-900"
      style={{ paddingBottom: bottom }}
    >
      <View className="space-y-2 py-3">
        <View className="h-1 w-20 self-center bg-[#D9D9D9] px-4" />

        {withBackButton && (
          <View className="px-4">
            <IconContainer
              eventElementId={null}
              eventName={null}
              eventContext={null}
              icon={<XMarkIcon />}
              onPress={navigation.goBack}
            />
          </View>
        )}
      </View>

      {scrollable && <ScrollView className="flex-grow px-4">{children}</ScrollView>}
      {!scrollable && <View className="flex-grow px-4">{children}</View>}
    </View>
  );
}
