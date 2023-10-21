import { graphql, useFragment } from 'react-relay';

import { ProcessedTextFragment$key } from '~/generated/ProcessedTextFragment.graphql';
import GalleryProcessedText from '~/shared/components/GalleryProccessedText/GalleryProcessedText';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';

import { LinkComponent } from './elements/LinkComponent';
import { MentionComponent } from './elements/MentionComponent';
import { TextComponent } from './elements/TextComponent';

type ProcessedTextProps = {
  text: string;
  mentionsRef?: ProcessedTextFragment$key;
  eventContext: GalleryElementTrackingProps['eventContext'];
};

export default function ProcessedText({
  text,
  mentionsRef = [],
  eventContext,
}: ProcessedTextProps) {
  const mentions = useFragment(
    graphql`
      fragment ProcessedTextFragment on Mention @relay(plural: true) {
        __typename
        ...GalleryProcessedTextFragment
        ...MentionComponentFragment
      }
    `,
    mentionsRef
  );

  return (
    <GalleryProcessedText
      text={text}
      mentionsRef={mentions}
      TextComponent={TextComponent}
      LinkComponent={(props) => <LinkComponent {...props} eventContext={eventContext} />}
      MentionComponent={(props) => <MentionComponent {...props} mentionsRef={mentions} />}
      BreakComponent={() => <br />}
    />
  );
}
