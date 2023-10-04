import { ReactNode, useCallback, useMemo, useRef } from 'react';
import { Text } from 'react-native';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { Typography } from '~/components/Typography';
import { VALID_URL } from '~/shared/utils/regex';

import { WarningLinkBottomSheet } from '../Posts/WarningLinkBottomSheet';

type LinkProps = {
  url: string;
};

const LinkComponent = ({ url }: LinkProps) => {
  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const handleLinkPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  return (
    <>
      <Text className="text-shadow" onPress={handleLinkPress}>
        {url}
      </Text>
      <WarningLinkBottomSheet redirectUrl={url} ref={bottomSheetRef} />
    </>
  );
};

type CommentProps = {
  comment: string;
};

// Makes a raw comment value display-ready by converting urls to link components
export default function ProcessedCommentText({ comment }: CommentProps) {
  const processedText = useMemo(() => {
    const chunks = comment.split(VALID_URL);
    const urls = comment.match(VALID_URL);

    const result: ReactNode[] = [];

    chunks.forEach((chunk, index) => {
      result.push(<Text key={`text-${index}`}>{chunk}</Text>);
      if (urls && urls[index]) {
        result.push(<LinkComponent key={`link-${index}`} url={urls[index] ?? ''} />);
      }
    });

    return result;
  }, [comment]);

  return (
    <>
      <Typography
        className="text-sm"
        font={{ family: 'ABCDiatype', weight: 'Regular' }}
        style={{ fontSize: 14, lineHeight: 18, paddingVertical: 2 }}
      >
        {processedText}
      </Typography>
    </>
  );
}
