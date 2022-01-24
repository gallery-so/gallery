/**
 * @generated SignedSource<<b422eda85a99008ce2de193d9d797662>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MemberListPageFragment$data = {
  readonly membershipTiers: ReadonlyArray<{
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"MemberListTierFragment">;
  } | null>;
  readonly " $fragmentType": "MemberListPageFragment";
};
export type MemberListPageFragment = MemberListPageFragment$data;
export type MemberListPageFragment$key = {
  readonly " $data"?: MemberListPageFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"MemberListPageFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "MemberListPageFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "concreteType": "MembershipTier",
        "kind": "LinkedField",
        "name": "membershipTiers",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "MemberListTierFragment"
          }
        ],
        "storageKey": null
      },
      "action": "THROW",
      "path": "membershipTiers"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "fe783cfeb5e905a169d4e9facb7a65fb";

export default node;
