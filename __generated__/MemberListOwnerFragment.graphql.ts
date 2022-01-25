/**
 * @generated SignedSource<<cbdc99543875c613d22fcccf8d42f663>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MemberListOwnerFragment$data = {
  readonly user: {
    readonly username: string;
  };
  readonly previewNfts: ReadonlyArray<string | null> | null;
  readonly " $fragmentType": "MemberListOwnerFragment";
};
export type MemberListOwnerFragment = MemberListOwnerFragment$data;
export type MemberListOwnerFragment$key = {
  readonly " $data"?: MemberListOwnerFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"MemberListOwnerFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "MemberListOwnerFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "concreteType": "GalleryUser",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "username",
              "storageKey": null
            },
            "action": "THROW",
            "path": "user.username"
          }
        ],
        "storageKey": null
      },
      "action": "THROW",
      "path": "user"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "previewNfts",
      "storageKey": null
    }
  ],
  "type": "MembershipTierOwner",
  "abstractKey": null
};

(node as any).hash = "2c1aa6892654426b42ae7258cfded007";

export default node;
