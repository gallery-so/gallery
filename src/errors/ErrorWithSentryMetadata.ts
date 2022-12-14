import { Primitive } from 'relay-runtime/lib/store/RelayStoreTypes';

export class ErrorWithSentryMetadata extends Error {
  public metadata: Record<string, Primitive>;

  constructor(message: string, metadata: Record<string, Primitive>) {
    super(message);

    this.metadata = metadata ?? {};

    Object.setPrototypeOf(this, ErrorWithSentryMetadata.prototype);
  }

  addMetadata(metadata: Record<string, Primitive>) {
    Object.assign(this.metadata, metadata);
  }
}
