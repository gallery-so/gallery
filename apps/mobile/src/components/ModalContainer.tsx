import { useNavigation } from '@react-navigation/native';
import { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconContainer } from '~/components/IconContainer';

import { CloseIcon } from '../icons/CloseIcon';

type Props = PropsWithChildren<{
  withBackButton?: boolean;
}>;

export function ModalContainer({ children, withBackButton = false }: Props) {
  const { bottom } = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View className="flex h-full flex-col bg-white" style={{ paddingBottom: bottom }}>
      <View className="space-y-2 bg-white py-3">
        <View className="h-1 w-20 self-center bg-[#D9D9D9] px-4" />

        {withBackButton && (
          <View className="px-4">
            <IconContainer icon={<CloseIcon />} onPress={navigation.goBack} />
          </View>
        )}
      </View>

      <ScrollView className="px-4">{children}</ScrollView>
    </View>
  );
}
