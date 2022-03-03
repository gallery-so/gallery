/**
 * @generated SignedSource<<15e65c38bbc254cad15df09eaa17017d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type authRequestUtilsCreateNonceMutation$variables = {
  address: string;
};
export type authRequestUtilsCreateNonceMutationVariables = authRequestUtilsCreateNonceMutation$variables;
export type authRequestUtilsCreateNonceMutation$data = {
  readonly getAuthNonce: {
    readonly __typename: "AuthNonce";
    readonly userExists: boolean;
    readonly nonce: string;
  } | {
    readonly __typename: "ErrDoesNotOwnRequiredNFT";
    readonly message: string;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null;
};
export type authRequestUtilsCreateNonceMutationResponse = authRequestUtilsCreateNonceMutation$data;
export type authRequestUtilsCreateNonceMutation = {
  variables: authRequestUtilsCreateNonceMutationVariables;
  response: authRequestUtilsCreateNonceMutation$data;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "address"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "address",
    "variableName": "address"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "userExists",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nonce",
  "storageKey": null
},
v5 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "message",
      "storageKey": null
    }
  ],
  "type": "ErrDoesNotOwnRequiredNFT",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "authRequestUtilsCreateNonceMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "getAuthNonce",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "kind": "RequiredField",
                "field": (v3/*: any*/),
                "action": "THROW",
                "path": "getAuthNonce.userExists"
              },
              {
                "kind": "RequiredField",
                "field": (v4/*: any*/),
                "action": "THROW",
                "path": "getAuthNonce.nonce"
              }
            ],
            "type": "AuthNonce",
            "abstractKey": null
          },
          (v5/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "authRequestUtilsCreateNonceMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "getAuthNonce",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/)
            ],
            "type": "AuthNonce",
            "abstractKey": null
          },
          (v5/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "73cb1ec8da2237555ff44a2066705b18",
    "id": null,
    "metadata": {},
    "name": "authRequestUtilsCreateNonceMutation",
    "operationKind": "mutation",
    "text": "mutation authRequestUtilsCreateNonceMutation(\n  $address: String!\n) {\n  getAuthNonce(address: $address) {\n    __typename\n    ... on AuthNonce {\n      userExists\n      nonce\n    }\n    ... on ErrDoesNotOwnRequiredNFT {\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0877f8eea2ee18bd020d9cde57a1b966";

export default node;
