import { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { ChatIcon } from 'src/icons/ChatIcon';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from './GalleryBottomSheet/GalleryBottomSheetModal';
import { Typography } from './Typography';

type Props = {
  username: string;
};

export function WelcomeToBeta({ username }: Props) {
  const snapPoints = useMemo(() => [500], []);
  const bottomSheetRef = useRef<GalleryBottomSheetModalType>(null);
  useEffect(() => bottomSheetRef.current?.present(), []);

  const capitalizedUsername = useMemo(() => {
    return username.charAt(0).toUpperCase() + username.slice(1);
  }, [username]);

  return (
    <GalleryBottomSheetModal ref={bottomSheetRef} index={0} snapPoints={snapPoints}>
      <View className="flex flex-column space-y-2 mx-4 mt-2">
        <Typography className="text-xl" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          ☀️ Welcome, {capitalizedUsername}.
        </Typography>
        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          Thank you for testing the Gallery mobile app!
        </Typography>
        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          Reminder: our app is still in beta and you’re one of the first to take it for a spin.
          We’ll be fixing and polishing so don’t be surprised if you see changes.
        </Typography>
        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          Your feedback is invaluable — if there's something you'd love to see, any rough edges you
          spot, (or just want to say something nice) let us know using the{' '}
          <ChatIcon width={20} height={20} /> icon.
        </Typography>
        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          We’re building the best way for people to connect through creativity and we’re so thrilled
          to have you with us. We can't wait to share some of the big social features we have in the
          works – stay tuned!
        </Typography>
        <Typography
          style={{ textAlign: 'center', paddingTop: 16 }}
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          ❤️ The Gallery Team
        </Typography>
      </View>
    </GalleryBottomSheetModal>
  );
}
