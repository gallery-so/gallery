import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { Button } from '~/components/Button';
import { useToastActions } from '~/contexts/ToastContext';
import { contexts } from '~/shared/analytics/constants';
import { useUnblockUser } from '~/shared/hooks/useUnblockUser';

import { Typography } from '../Typography';

type Props = {
  userId: string;
  username: string;
  onBlockUser: () => Promise<void>;
  onDismiss: () => void;
};

/**
 * When this modal opens, we assume the user has been blocked. Afterwards, the user will have
 * the ability to block / unblock from this step.
 */
export function BlockUserConfirmationForm({ userId, username, onBlockUser, onDismiss }: Props) {
  const [isBlocked, setIsBlocked] = useState(true);

  const handleBlock = useCallback(async () => {
    console.log('BLOCKING');
    await onBlockUser();
    setIsBlocked(true);
  }, [onBlockUser]);

  const unblockUser = useUnblockUser();

  const { pushToast } = useToastActions();

  const handleUnblock = useCallback(async () => {
    try {
      console.log('UNBLOCKING');
      await unblockUser(userId);
    } catch (e: unknown) {
      pushToast({ message: "Failed to unblock user. We're looking into it." });
      onDismiss();
      return;
    }
    setIsBlocked(false);
  }, [onDismiss, pushToast, unblockUser, userId]);

  return (
    <View className="flex flex-col space-y-2">
      {isBlocked ? (
        <>
          <Typography className="text-lg" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {username} has been blocked
          </Typography>
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            You won’t see this users posts in your feed anymore. They are now unable to view your
            profile or tag you in comments and posts.
          </Typography>
          <Button
            text="Unblock"
            onPress={handleUnblock}
            eventContext={contexts.UserGallery}
            eventElementId={null}
            eventName={null}
          />
          <Button
            text="Close"
            variant="secondary"
            onPress={onDismiss}
            eventContext={contexts.UserGallery}
            eventElementId={null}
            eventName={null}
          />
        </>
      ) : (
        <>
          <Typography className="text-lg" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {username} has been unblocked
          </Typography>
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            You may now interact with the user and vice versa.
          </Typography>
          <Button
            text="Block"
            onPress={handleBlock}
            eventContext={contexts.UserGallery}
            eventElementId={null}
            eventName={null}
          />
          <Button
            text="Close"
            variant="secondary"
            onPress={onDismiss}
            eventContext={contexts.UserGallery}
            eventElementId={null}
            eventName={null}
          />
        </>
      )}
    </View>
  );
}
