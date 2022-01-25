/**
 * @generated SignedSource<<3987c62283a18096e8534c23ad422093>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type membersQuery$variables = {};
export type membersQueryVariables = membersQuery$variables;
export type membersQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"MemberListPageFragment">;
};
export type membersQueryResponse = membersQuery$data;
export type membersQuery = {
  variables: membersQueryVariables;
  response: membersQuery$data;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "membersQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "MemberListPageFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "membersQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "MembershipTier",
        "kind": "LinkedField",
        "name": "membershipTiers",
        "plural": true,
        "selections": [
          (v0/*: any*/),
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
              (v0/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "GalleryUser",
                "kind": "LinkedField",
                "name": "user",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "username",
                    "storageKey": null
                  },
                  (v0/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "previewNfts",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4495cf850e43c8a6d34d58461acd9bd3",
    "id": null,
    "metadata": {},
    "name": "membersQuery",
    "operationKind": "query",
    "text": "query membersQuery {\n  ...MemberListPageFragment\n}\n\nfragment MemberListOwnerFragment on MembershipTierOwner {\n  user {\n    username\n    id\n  }\n  previewNfts\n}\n\nfragment MemberListPageFragment on Query {\n  membershipTiers {\n    id\n    ...MemberListTierFragment\n  }\n}\n\nfragment MemberListTierFragment on MembershipTier {\n  name\n  owners {\n    id\n    user {\n      username\n      id\n    }\n    ...MemberListOwnerFragment\n  }\n}\n"
  }
};
})();

(node as any).hash = "9ba18fdbfda4b60625ec6cc1fed4c1a0";

export default node;
