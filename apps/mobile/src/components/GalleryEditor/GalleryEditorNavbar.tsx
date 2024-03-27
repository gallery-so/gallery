import { View } from 'react-native';

import { BackButton } from '../BackButton';
import { Button } from '../Button';

export function GalleryEditorNavbar() {
  return (
    <View className="p-4 flex-row items-center justify-between">
      <BackButton />

      <Button
        text="Publish"
        eventElementId={null}
        eventName={null}
        eventContext={null}
        size="xs"
        fontWeight="Bold"
      />
    </View>
  );
}
