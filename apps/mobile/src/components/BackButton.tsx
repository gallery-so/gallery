import { useNavigation } from '@react-navigation/native';

import { IconContainer } from '~/components/IconContainer';

import { BackIcon } from '../icons/BackIcon';

export function BackButton() {
  const navigation = useNavigation();

  return <IconContainer icon={<BackIcon />} onPress={navigation.goBack} />;
}
