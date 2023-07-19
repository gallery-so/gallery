import { useNavigation } from '@react-navigation/native';

import { IconContainer } from '~/components/IconContainer';

import { BackIcon } from '../icons/BackIcon';

type Props = {
  onPress?: () => void;
};

export function BackButton({ onPress }: Props) {
  const navigation = useNavigation();

  const handlePress = onPress ?? navigation.goBack;

  return (
    <IconContainer
      eventElementId={null}
      eventName={null}
      icon={<BackIcon />}
      onPress={handlePress}
    />
  );
}
