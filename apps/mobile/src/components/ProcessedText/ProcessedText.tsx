import { TextProps, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { ProcessedTextFragment$key } from '~/generated/ProcessedTextFragment.graphql';
import GalleryProcessedText from '~/shared/components/GalleryProccessedText/GalleryProcessedText';

import { LinkComponent } from './elements/LinkComponent';
import { MentionComponent } from './elements/MentionComponent';
import { TextComponent } from './elements/TextComponent';

type ProcessedTextProps = {
  text: string;
  mentionsRef?: ProcessedTextFragment$key;
} & TextProps;

// Makes a raw text value display-ready by converting urls to link components
// export default function ProcessedText({ text, mentionsRef = [], ...props }: ProcessedTextProps) {
export default function ProcessedText({ text, mentionsRef = [] }: ProcessedTextProps) {
  const mentions = useFragment(
    graphql`
      fragment ProcessedTextFragment on Mention @relay(plural: true) {
        __typename
        ...GalleryProcessedTextFragment
      }
    `,
    mentionsRef
  );

  return (
    <GalleryProcessedText
      text={text}
      mentionsRef={mentions}
      TextComponent={TextComponent}
      LinkComponent={LinkComponent}
      MentionComponent={MentionComponent}
      BreakComponent={() => <View />}
    />
  );
}
