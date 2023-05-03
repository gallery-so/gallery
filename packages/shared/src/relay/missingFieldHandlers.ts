import { MissingFieldHandler } from 'relay-runtime';
import { ReadOnlyRecordSourceProxy } from 'relay-runtime/lib/store/RelayStoreTypes';
import { NormalizationLinkedField } from 'relay-runtime/lib/util/NormalizationNode';
import { ReaderLinkedField } from 'relay-runtime/lib/util/ReaderNode';
import { Variables } from 'relay-runtime/lib/util/RelayRuntimeTypes';

export function createMissingFieldHandlers(): MissingFieldHandler[] {
  const handler: MissingFieldHandler = {
    kind: 'linked',
    handle: (
      field: NormalizationLinkedField | ReaderLinkedField,
      parentRecord: unknown,
      args: Variables,
      _: ReadOnlyRecordSourceProxy
    ) => {
      if (field.name === 'galleryById') {
        return `Gallery:${args.id}`;
      }

      if (field.name === 'collectionById') {
        return `Collection:${args.id}`;
      }

      return undefined;
    },
  };

  return [handler];
}
