import { Primitive } from 'relay-runtime/lib/store/RelayStoreTypes';

export class CouldNotRenderNftError extends Error {
  public metadata: Record<string, Primitive>;
  public componentName: string;

  constructor(componentName: string, reason: string, metadata?: Record<string, Primitive>) {
    super(`${componentName}: ${reason}`);

    this.componentName = componentName;
    this.metadata = metadata ?? {};

    Object.setPrototypeOf(this, CouldNotRenderNftError.prototype);
  }
}
