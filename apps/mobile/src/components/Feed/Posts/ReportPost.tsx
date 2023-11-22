import { set } from 'date-fns';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { BottomSheetRow } from '~/components/BottomSheetRow';
import { Button } from '~/components/Button';
import { Typography } from '~/components/Typography';
import { contexts } from '~/shared/analytics/constants';

enum ReportReason {
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  SPAM_AND_OR_BOT = 'SPAM_AND_OR_BOT',
  SOMETHING_ELSE = 'SOMETHING_ELSE',
}

export default function ReportPost() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const handleSubmitReport = useCallback((reason: ReportReason) => {
    // submit
    console.log(reason);
    setIsSubmitted(true);
  }, []);
  return (
    <View className="flex flex-col space-y-2">
      {isSubmitted ? (
        <>
          <Typography className="text-lg" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            Report submitted
          </Typography>
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            Thanks for letting us know, our team will investigate as soon as possible.
          </Typography>
          <Button
            text="Close"
            variant="secondary"
            onPress={() => {
              // close bottom sheet
            }}
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
            onPress={() => handleSubmitReport(ReportReason.INAPPROPRIATE_CONTENT)}
            eventContext={contexts.Posts}
          />
          <BottomSheetRow
            text="It's spam/a bot"
            onPress={() => handleSubmitReport(ReportReason.SPAM_AND_OR_BOT)}
            eventContext={contexts.Posts}
          />
          <BottomSheetRow
            text="Something else"
            onPress={() => handleSubmitReport(ReportReason.SOMETHING_ELSE)}
            eventContext={contexts.Posts}
          />
        </>
      )}
    </View>
  );
}
