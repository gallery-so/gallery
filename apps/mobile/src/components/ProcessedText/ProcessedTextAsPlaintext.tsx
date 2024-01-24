import { Text, TextProps } from 'react-native';

import { Typography } from '~/components/Typography';
import GalleryProcessedText from '~/shared/components/GalleryProccessedText/GalleryProcessedText';

import { MentionComponent } from './elements/MentionComponent';
import { TextComponent } from './elements/TextComponent';

type ProcessedTextProps = {
  text: string;
} & TextProps;

export default function ProcessedTextAsPlaintext({ text, ...props }: ProcessedTextProps) {
  return (
    <GalleryProcessedText
      text={text}
      mentionsRef={[]}
      LinkComponent={({ url, value }) => (
        <>
          <Typography
            className="text-sm"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
            style={{ fontSize: 14, lineHeight: 18, paddingVertical: 2 }}
          >
            {value ?? url}
          </Typography>
        </>
      )}
      TextComponent={TextComponent}
      MentionComponent={MentionComponent}
      BreakComponent={() => <Text>{'\n'}</Text>}
      {...props}
    />
  );
}
