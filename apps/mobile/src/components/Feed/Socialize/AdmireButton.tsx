import { TouchableOpacityProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { useToggleAdmire } from 'src/hooks/useToggleAdmire';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { AdmireButtonFragment$key } from '~/generated/AdmireButtonFragment.graphql';
import { AdmireButtonQueryFragment$key } from '~/generated/AdmireButtonQueryFragment.graphql';

import { AdmireIcon } from './AdmireIcon';

type Props = {
  eventRef: AdmireButtonFragment$key;
  queryRef: AdmireButtonQueryFragment$key;
  style?: TouchableOpacityProps['style'];
};

export function AdmireButton({ eventRef, queryRef, style }: Props) {
  const event = useFragment(
    graphql`
      fragment AdmireButtonFragment on FeedEvent {
        ...useToggleAdmireFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment AdmireButtonQueryFragment on Query {
        ...useToggleAdmireQueryFragment
      }
    `,
    queryRef
  );

  const { toggleAdmire, hasViewerAdmiredEvent } = useToggleAdmire({
    eventRef: event,
    queryRef: query,
  });

  return (
    <GalleryTouchableOpacity
      onPress={toggleAdmire}
      className="flex justify-center align-center w-8 h-8 pt-0.5"
      style={style}
      eventElementId="Admire Button"
      eventName="Admire Button Clicked"
    >
      <AdmireIcon active={hasViewerAdmiredEvent} />
    </GalleryTouchableOpacity>
  );
}
