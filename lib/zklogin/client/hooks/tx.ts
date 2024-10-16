/**
 * Copyright 2023-2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Keypair } from "@mysten/sui/cryptography";
import { fromB64 } from "@mysten/sui/utils";
import { MutationFunction } from "@tanstack/react-query";
import { Struct } from "superstruct";
import { PreparedTransactionBytes, SignedTransactionBytes } from "../../tx";
import { apiMutationFn } from "./api";

export interface WithKeyPair {
  keyPair: Keypair;
}

export interface WithMultisigAddress {  
  multisigAddress: string;
}

/**
 * Helper function to generate TanStack mutation functions for end-to-end Sui transaction block
 * execution.
 *
 * Must be used on API routes implemented with `zkLoginSponsoredTxExecHandler` or
 * `zkLoginTxExecHandler` from `@/lib/zklogin/server/pages`.
 */
export function apiTxExecMutationFn<
  T = unknown,
  P extends WithKeyPair = WithKeyPair,
  Q extends WithMultisigAddress = WithMultisigAddress,
>({
  baseUri,
  body,
  resultSchema,
}: {
  baseUri: (params: P) => string;
  body?: (params: P) => unknown;
  resultSchema?: Struct<T>;
}): MutationFunction<T, P> {
  const _body = body ?? (({ keyPair, ...params }) => params);

  return async (params: P) => {
    const uri = baseUri(params);
    const tx = await apiMutationFn({
      uri: () => `${uri}/tx`,
      body: _body,
      resultSchema: PreparedTransactionBytes,
    })(params);
    const { signature } = await params.keyPair.signTransaction(
      fromB64(tx.txBytes),
    );
    return await apiMutationFn<T, SignedTransactionBytes>({
      uri: () => `${uri}/exec`,
      resultSchema,
    })({ ...tx, signature });
  };
}
