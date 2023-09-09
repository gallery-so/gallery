import { useNavigation } from '@react-navigation/native';

import { IconContainer } from '~/components/IconContainer';

import { BackIcon } from '../icons/BackIcon';

type Props = {
  onPress?: () => void;
  size?: 'sm' | 'md';
};

export function BackButton({ onPress, size = 'md' }: Props) {
  const navigation = useNavigation();

  const handlePress = onPress ?? navigation.goBack;

  return (
    <IconContainer
      size={size}
      eventElementId={null}
      eventName={null}
      icon={<BackIcon />}
      onPress={handlePress}
    />
  );
}
