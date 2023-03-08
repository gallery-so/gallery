import { ErrorWithSentryMetadata } from './ErrorWithSentryMetadata';

export class TriedToRenderUnsupportedFeedEvent extends ErrorWithSentryMetadata {
  public eventId: string;

  constructor(eventId: string) {
    super(`Tried to render unsupported feed event`, { eventId });

    this.eventId = eventId;

    Object.setPrototypeOf(this, TriedToRenderUnsupportedFeedEvent.prototype);
  }
}
