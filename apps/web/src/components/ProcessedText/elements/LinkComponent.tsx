import GalleryLink, {
  GalleryLinkNeedsVerification,
} from '~/components/core/GalleryLink/GalleryLink';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';

type LinkComponentProps = {
  value?: string;
  url: string;
  eventContext: GalleryElementTrackingProps['eventContext'];
};

export function LinkComponent({ url, value, eventContext }: LinkComponentProps) {
  const isInternalLink = url.startsWith('https://gallery.so/');

  if (isInternalLink) {
    return (
      <GalleryLink
        inheritLinkStyling
        // @ts-expect-error convert to an internal redirect. typescript complains because
        // this is a dynamic route that we haven't explicitly defined
        to={{ pathname: url.replace('https://gallery.so', '') }}
        eventElementId="Markdown Link"
        eventName="Markdown Link Click"
        eventContext={eventContext}
      >
        {value ?? url}
      </GalleryLink>
    );
  }
  return (
    <GalleryLinkNeedsVerification inheritLinkStyling href={url}>
      {value ?? url}
    </GalleryLinkNeedsVerification>
  );
}
