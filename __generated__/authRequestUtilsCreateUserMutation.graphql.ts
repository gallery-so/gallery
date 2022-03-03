/**
 * @generated SignedSource<<b087d51a5f4c53d28b523aa5483521a4>>
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
export type authRequestUtilsCreateUserMutation$variables = {
  mechanism: AuthMechanism;
};
export type authRequestUtilsCreateUserMutationVariables = authRequestUtilsCreateUserMutation$variables;
export type authRequestUtilsCreateUserMutation$data = {
  readonly createUser: {
    readonly __typename: "CreateUserPayload";
    readonly userId: string;
  } | {
    readonly __typename: "ErrUserAlreadyExists";
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
export type authRequestUtilsCreateUserMutationResponse = authRequestUtilsCreateUserMutation$data;
export type authRequestUtilsCreateUserMutation = {
  variables: authRequestUtilsCreateUserMutationVariables;
  response: authRequestUtilsCreateUserMutation$data;
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
  "type": "ErrUserAlreadyExists",
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
    "name": "authRequestUtilsCreateUserMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "createUser",
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
                "path": "createUser.userId"
              }
            ],
            "type": "CreateUserPayload",
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
    "name": "authRequestUtilsCreateUserMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "createUser",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/)
            ],
            "type": "CreateUserPayload",
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
    "cacheID": "7f935a08986cd30f08d1eeb1c49ea8f5",
    "id": null,
    "metadata": {},
    "name": "authRequestUtilsCreateUserMutation",
    "operationKind": "mutation",
    "text": "mutation authRequestUtilsCreateUserMutation(\n  $mechanism: AuthMechanism!\n) {\n  createUser(authMechanism: $mechanism) {\n    __typename\n    ... on CreateUserPayload {\n      userId\n    }\n    ... on ErrUserAlreadyExists {\n      message\n    }\n    ... on ErrAuthenticationFailed {\n      message\n    }\n    ... on ErrDoesNotOwnRequiredNFT {\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "fafd432328b02cd983ab521a71b26349";

export default node;
