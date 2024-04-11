import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { contexts } from '~/shared/analytics/constants';

import { Button } from '../Button';
import { Markdown } from '../Markdown';

import { Typography } from '../Typography';

type Props = {
  title: string;
  description: string;
  onClose: () => void;
};

const markdownStyles = StyleSheet.create({
  paragraph: {
    marginBottom: 0,
  },
  body: {
    fontSize: 18,
  },
  strong: {
    fontFamily: 'ABCDiatypeBold',
  },
});

export default function BadgeProfileBottomSheet({ title, description, onClose }: Props) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <View className="flex flex-col space-y-6">
      <View className="flex flex-col space-y-4">
        <Typography
          className="text-lg text-black-900 dark:text-offWhite"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            className="text-lg text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            <Markdown style={markdownStyles}>{description}</Markdown>
          </Typography>
        )}
      </View>

      <Button
        onPress={handleClose}
        text="CLOSE"
        eventElementId="Close badge details"
        eventName="Close badge"
        eventContext={contexts.Badge}
        variant="secondary"
      />
    </View>
  );
}
