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

  const [isLoading, setIsLoading] = useState(false);

  const handleBlock = useCallback(async () => {
    setIsLoading(true);
    await onBlockUser();
    setIsBlocked(true);
    setIsLoading(false);
  }, [onBlockUser]);

  const unblockUser = useUnblockUser();

  const { pushToast } = useToastActions();

  const handleUnblock = useCallback(async () => {
    setIsLoading(true);
    try {
      await unblockUser(userId);
    } catch (e: unknown) {
      pushToast({ message: "Failed to unblock user. We're looking into it." });
      onDismiss();
      return;
    } finally {
      setIsLoading(false);
    }
    setIsBlocked(false);
  }, [onDismiss, pushToast, unblockUser, userId]);

  return (
    <View className="space-y-6">
      <View className="flex flex-col space-y-2">
        <Typography className="text-lg" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          {username} has been {isBlocked ? 'blocked' : 'unblocked'}
        </Typography>
        <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          {isBlocked
            ? 'They are now unable to view your profile or tag you in comments and posts.'
            : 'You may now interact with the user and vice versa.'}
        </Typography>
      </View>
      <View className="flex flex-col space-y-2">
        <Button
          text={isBlocked ? 'Unblock' : 'Block'}
          loading={isLoading}
          variant="secondary"
          onPress={isBlocked ? handleUnblock : handleBlock}
          eventContext={contexts.UserGallery}
          eventElementId={null}
          eventName={null}
        />
        <Button
          text="Close"
          onPress={onDismiss}
          eventContext={contexts.UserGallery}
          eventElementId={null}
          eventName={null}
        />
      </View>
    </View>
  );
}
