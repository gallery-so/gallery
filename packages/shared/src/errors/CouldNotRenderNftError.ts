import { Primitive } from 'relay-runtime/lib/store/RelayStoreTypes';

import { ErrorWithSentryMetadata } from './ErrorWithSentryMetadata';

export class CouldNotRenderNftError extends ErrorWithSentryMetadata {
  public componentName: string;

  constructor(componentName: string, reason: string, metadata?: Record<string, Primitive>) {
    super(`Could not render NFT`, { ...metadata, componentName, reason });

    this.componentName = componentName;

    Object.setPrototypeOf(this, CouldNotRenderNftError.prototype);
  }
}
