/**
 * @generated SignedSource<<5d9c087fa7f878b30e3447121e925c3f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MemberListTierFragment$data = {
  readonly name: string | null;
  readonly owners: ReadonlyArray<{
    readonly id: string;
    readonly user: {
      readonly username: string;
    };
    readonly " $fragmentSpreads": FragmentRefs<"MemberListOwnerFragment">;
  } | null> | null;
  readonly " $fragmentType": "MemberListTierFragment";
};
export type MemberListTierFragment = MemberListTierFragment$data;
export type MemberListTierFragment$key = {
  readonly " $data"?: MemberListTierFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"MemberListTierFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "MemberListTierFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "MembershipTierOwner",
      "kind": "LinkedField",
      "name": "owners",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        },
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
                "action": "NONE",
                "path": "owners.user.username"
              }
            ],
            "storageKey": null
          },
          "action": "NONE",
          "path": "owners.user"
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "MemberListOwnerFragment"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "MembershipTier",
  "abstractKey": null
};

(node as any).hash = "c6eb3bc46d1c40531805f70f045d5051";

export default node;
