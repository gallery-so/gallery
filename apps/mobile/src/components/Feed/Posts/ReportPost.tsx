import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { BottomSheetRow } from '~/components/BottomSheetRow';
import { Button } from '~/components/Button';
import { Typography } from '~/components/Typography';
import { useToastActions } from '~/contexts/ToastContext';
import { ReportReason } from '~/generated/useReportPostMutation.graphql';
import { contexts } from '~/shared/analytics/constants';
import { useReportPost } from '~/shared/hooks/useReportPost';

type Props = {
  postId: string;
  onDismiss: () => void;
};

export default function ReportPost({ postId, onDismiss }: Props) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const reportPost = useReportPost();

  const { pushToast } = useToastActions();

  const handleSubmitReport = useCallback(
    async (reason: ReportReason) => {
      try {
        await reportPost(postId, reason);
      } catch (e: unknown) {
        pushToast({ message: "Failed to report post. We're looking into it." });
        onDismiss();
        return;
      }
      setIsSubmitted(true);
    },
    [onDismiss, postId, pushToast, reportPost]
  );

  return (
    <View className="flex flex-col space-y-2">
      {isSubmitted ? (
        <>
          <Typography className="text-lg" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            Report submitted
          </Typography>
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            Thanks for letting us know. Our team will investigate as soon as possible.
          </Typography>
          <Button
            text="Close"
            variant="secondary"
            onPress={onDismiss}
            eventContext={contexts.Posts}
            eventElementId={null}
            eventName={null}
          />
        </>
      ) : (
        <>
          <Typography className="text-lg" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            Why are you reporting this?
          </Typography>
          <BottomSheetRow
            text="It's inappropriate"
            onPress={() => handleSubmitReport('INAPPROPRIATE_CONTENT')}
            eventContext={contexts.Posts}
          />
          <BottomSheetRow
            text="It's spam / bot activity"
            onPress={() => handleSubmitReport('SPAM_AND_OR_BOT')}
            eventContext={contexts.Posts}
          />
          <BottomSheetRow
            text="Something else"
            onPress={() => handleSubmitReport('SOMETHING_ELSE')}
            eventContext={contexts.Posts}
          />
        </>
      )}
    </View>
  );
}
