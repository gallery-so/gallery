/**
 * @generated SignedSource<<3f2b43902d242f1c86fc6016fdae9cad>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type AuthMechanism = {
  ethereumEoa?: EthereumEoaAuth | null;
  gnosisSafe?: GnosisSafeAuth | null;
};
export type EthereumEoaAuth = {
  address: string;
  nonce: string;
  signature: string;
};
export type GnosisSafeAuth = {
  address: string;
  nonce: string;
  signature: string;
};
export type authRequestUtilsLoginMutation$variables = {
  mechanism: AuthMechanism;
};
export type authRequestUtilsLoginMutationVariables = authRequestUtilsLoginMutation$variables;
export type authRequestUtilsLoginMutation$data = {
  readonly login: {
    readonly __typename: "LoginPayload";
    readonly userId: string;
  } | {
    readonly __typename: "ErrUserNotFound";
    readonly message: string;
  } | {
    readonly __typename: "ErrAuthenticationFailed";
    readonly message: string;
  } | {
    readonly __typename: "ErrDoesNotOwnRequiredNFT";
    readonly message: string;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null;
};
export type authRequestUtilsLoginMutationResponse = authRequestUtilsLoginMutation$data;
export type authRequestUtilsLoginMutation = {
  variables: authRequestUtilsLoginMutationVariables;
  response: authRequestUtilsLoginMutation$data;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "mechanism"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "authMechanism",
    "variableName": "mechanism"
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
  "name": "userId",
  "storageKey": null
},
v4 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "message",
    "storageKey": null
  }
],
v5 = {
  "kind": "InlineFragment",
  "selections": (v4/*: any*/),
  "type": "ErrUserNotFound",
  "abstractKey": null
},
v6 = {
  "kind": "InlineFragment",
  "selections": (v4/*: any*/),
  "type": "ErrAuthenticationFailed",
  "abstractKey": null
},
v7 = {
  "kind": "InlineFragment",
  "selections": (v4/*: any*/),
  "type": "ErrDoesNotOwnRequiredNFT",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "authRequestUtilsLoginMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "login",
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
                "path": "login.userId"
              }
            ],
            "type": "LoginPayload",
            "abstractKey": null
          },
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/)
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
    "name": "authRequestUtilsLoginMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "login",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/)
            ],
            "type": "LoginPayload",
            "abstractKey": null
          },
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "72ea449443bb1200aee44135462badaa",
    "id": null,
    "metadata": {},
    "name": "authRequestUtilsLoginMutation",
    "operationKind": "mutation",
    "text": "mutation authRequestUtilsLoginMutation(\n  $mechanism: AuthMechanism!\n) {\n  login(authMechanism: $mechanism) {\n    __typename\n    ... on LoginPayload {\n      userId\n    }\n    ... on ErrUserNotFound {\n      message\n    }\n    ... on ErrAuthenticationFailed {\n      message\n    }\n    ... on ErrDoesNotOwnRequiredNFT {\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "73d2172531fc3d35c34ce8dcdafa53de";

export default node;
