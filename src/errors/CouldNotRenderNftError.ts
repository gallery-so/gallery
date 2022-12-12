import { Primitive } from 'relay-runtime/lib/store/RelayStoreTypes';

import { ErrorWithSentryMetadata } from '~/errors/ErrorWithSentryMetadata';

export class CouldNotRenderNftError extends ErrorWithSentryMetadata {
  public componentName: string;

  constructor(componentName: string, reason: string, metadata?: Record<string, Primitive>) {
    super(`${componentName}: ${reason}`, metadata ?? {});

    this.componentName = componentName;

    Object.setPrototypeOf(this, CouldNotRenderNftError.prototype);
  }
}
