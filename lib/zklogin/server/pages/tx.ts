/**
 * Copyright 2023-2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SuiClient,
  SuiTransactionBlockResponse,
  SuiTransactionBlockResponseOptions,
} from "@mysten/sui/client";
import { GasStationClient, GaslessTransaction } from "@shinami/clients/sui";
import { NextApiHandler, NextApiRequest } from "next";
import { validate } from "superstruct";
import { ApiErrorBody } from "../../error";
import { PreparedTransactionBytes, SignedTransactionBytes } from "../../tx";
import { ZkLoginUser, assembleZkLoginSignature } from "../../user";
import { withZkLoginUserRequired } from "./session";
import { catchAllDispatcher, methodDispatcher } from "./utils";
import prisma from "lib/prisma";
import { MultiSigPublicKey } from "@mysten/sui/multisig";
import { base64ToUint8Array } from "utils";

export type GaslessTransactionBuilder<TAuth = unknown> = (
  req: NextApiRequest,
  user: ZkLoginUser<TAuth>,
) =>
  | Promise<Omit<GaslessTransaction, "sender">>
  | Omit<GaslessTransaction, "sender">;

export type TransactionBytesBuilder<TAuth = unknown> = (
  req: NextApiRequest,
  user: ZkLoginUser<TAuth>,
) => Promise<string> | string;

export type TransactionResponseParser<TAuth = unknown, TRes = unknown> = (
  req: NextApiRequest,
  txRes: SuiTransactionBlockResponse,
  user: ZkLoginUser<TAuth>,
) => Promise<TRes> | TRes;

export class InvalidRequest extends Error {}

function txHandler<TAuth = unknown>(
  buildTxBytes: TransactionBytesBuilder<TAuth>,
): NextApiHandler<PreparedTransactionBytes | ApiErrorBody> {
  return methodDispatcher({
    POST: async (req, res) => {
      const user = req.session.user! as ZkLoginUser<TAuth>;
      let txBase64;
      try {
        txBase64 = await buildTxBytes(req, user);
      } catch (e) {
        if (!(e instanceof InvalidRequest)) throw e;
        return res.status(400).json({ error: e.message });
      }
      res.json({ txBytes: txBase64 });
    },
  });
}

function sponsoredTxHandler<TAuth = unknown>(
  gas: GasStationClient,
  buildGaslessTx: GaslessTransactionBuilder<TAuth>,
): NextApiHandler<PreparedTransactionBytes | ApiErrorBody> {
  return methodDispatcher({
    POST: async (req, res) => {
      const user = req.session.user! as ZkLoginUser<TAuth>;
      let tx;
      try {
        tx = await buildGaslessTx(req, user);
      } catch (e) {
        if (!(e instanceof InvalidRequest)) throw e;
        return res.status(400).json({ error: e.message });
      }

      const { txBytes, signature } = await gas.sponsorTransaction({
        ...tx,
        sender: user.wallet,
      });
      res.json({ txBytes, gasSignature: signature, multisigAddress: req.body.multisigAddress });
    },
  });
}

function execHandler<TAuth = unknown, TRes = unknown>(
  sui: SuiClient,
  parseTxRes: TransactionResponseParser<TAuth, TRes>,
  txOptions: SuiTransactionBlockResponseOptions = {},
): NextApiHandler<TRes | ApiErrorBody> {
  return methodDispatcher({
    POST: async (req, res) => {
      const [error, body] = validate(req.body, SignedTransactionBytes, {
        mask: true,
      });
      if (error) return res.status(400).json({ error: error.message });

      const user = req.session.user! as ZkLoginUser<TAuth>;
      const zkSignature = assembleZkLoginSignature(user, body.signature);
      let multiSig;
      //const { pkSingle, pkZklogin } = await fetchMultiSigPublicKeysFromDatabase(user.id);
      // Fetch passkey users associated with the multisig address
     // const multiSigPublicKey = new MultiSigPublicKey(new TextEncoder().encode("0x785f805d109fdb7691a71ef8c88ef632a45ef74da8f01dfbc252afef3b30ac0c"))

      
      const response = await prisma.auth_recovery.findMany({
        where: {
          multisig_address: req.body.multisigAddress,
        },
      });
      if (response.length > 0) { 
        let multisigAddressRaw = response[0].multisig_address_raw
        console.log("req.body.multisigAddress", multisigAddressRaw)
        const multiSigPublicKey = new MultiSigPublicKey(base64ToUint8Array(multisigAddressRaw))

        const suiAddres = multiSigPublicKey.toSuiAddress();
        console.log("suiAddres", suiAddres)
        const zkSignature2 = assembleZkLoginSignature(user, body.signature);
        multiSig = multiSigPublicKey.combinePartialSignatures([zkSignature2]);
      }

     

        
      // MultiSigPublicKey.fromPublicKeys({
      //   threshold: 1,
      //   publicKeys: [
      //     { publicKey: response[0].identifier, weight: 1 },
      //     { publicKey: response[1].identifier, weight: 1 },
      //   ],
      // });
      // if (response.length > 0) {
      //   const multiSigPublicKey = MultiSigPublicKey.fromPublicKeys({
      //     threshold: 1,
      //     publicKeys: [
      //       { publicKey: response[0].identifier, weight: 1 },
      //       { publicKey: response[1].identifier, weight: 1 },
      //     ],
      //   });
      // }
      //const recoveries = json(response);
     // console.log( "multi address ", suiAddres);
      // console.log(recoveries);

      // const response = await fetch(`${process.env.API_HOST}/api/recover/getbymultisig`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ multisigAddress: req.body.multisigAddress }),
      // });

      // if (!response.ok) {
      //   throw new Error(`Failed to fetch passkey users: ${response.statusText}`);
      // }



      // Assuming the first passkey in the array contains the required public keys
      // if (passkeys.length === 0) {
      //   throw new Error('No passkey users found for this multisig address');
      // }

      // const pkSingle = passkeys[0].pk_single;
      // const pkZklogin = passkeys[0].pk_zklogin;

      // if (!pkSingle || !pkZklogin) {
      //   throw new Error('Missing required public keys in passkey data');
      // }

      // const multiSigPublicKey = MultiSigPublicKey.fromPublicKeys({
      //   threshold: 1,
      //   publicKeys: [
      //     { publicKey: pkSingle, weight: 1 },
      //     { publicKey: pkZklogin, weight: 1 },
      //   ],
      // });

      //const multisig = multiSigPublicKey.combinePartialSignatures([zkSignature]);

      // const txRes = await sui.executeTransactionBlock({
      //   transactionBlock: body.txBytes,
      //   signature: body.gasSignature
      //     ? [multiSig!, body.gasSignature]
      //     : multiSig!,
      //   options: { ...txOptions, showEffects: true },
      // });

      const txRes = await sui.executeTransactionBlock({
        transactionBlock: body.txBytes,
        signature: body.gasSignature
          ? [multiSig!, body.gasSignature]
          : multiSig!,
        options: { ...txOptions, showEffects: true },
      });

      if (txRes.effects?.status.status !== "success") {
        console.error("Tx execution failed", txRes);
        return res.status(500).json({
          error: `Tx execution failed: ${txRes.effects?.status.error}`,
        });
      }

      res.json(await parseTxRes(req, txRes, user));
    },
  });
}

/**
 * Implements API routes for building and executing a Sui transaction.
 *
 * Two routes are implemented under the hood:
 * - [base_route]/tx for building the transaction.
 * - [base_route]/exec for executing the transaction after signed by frontend, and parsing the
 *   transaction response.
 *
 * @param sui `SuiClient` for transaction building and execution.
 * @param buildTxBytes Function to build a transaction (encoded in Base64).
 * @param parseTxRes Function to parse the transaction response.
 * @param txOptions Transaction response options.
 * @returns A Next.js API route handler.
 */
export function zkLoginTxExecHandler<TAuth = unknown, TRes = unknown>(
  sui: SuiClient,
  buildTxBytes: TransactionBytesBuilder<TAuth>,
  parseTxRes: TransactionResponseParser<TAuth, TRes>,
  txOptions: SuiTransactionBlockResponseOptions = {},
): NextApiHandler {
  return withZkLoginUserRequired(
    sui,
    catchAllDispatcher({
      tx: txHandler(buildTxBytes),
      exec: execHandler(sui, parseTxRes, txOptions),
    }),
  );
}

/**
 * Implements API routes for building, sponsoring, and executing a Sui transaction.
 *
 * Two routes are implemented under the hood:
 * - [base_route]/tx for building and sponsoring the transaction.
 * - [base_route]/exec for executing the transaction after signed by frontend, and parsing the
 *   transaction response.
 *
 * @param sui `SuiClient` for transaction building and execution.
 * @param gas `GasStationClient` for sponsoring transaction.
 * @param buildGaslessTx Function to build a gasless transaction.
 * @param parseTxRes Function to parse the transaction response.
 * @param txOptions Transaction response options.
 * @returns A Next.js API route handler.
 */
export function zkLoginSponsoredTxExecHandler<TAuth = unknown, TRes = unknown>(
  sui: SuiClient,
  gas: GasStationClient,
  buildGaslessTx: GaslessTransactionBuilder<TAuth>,
  parseTxRes: TransactionResponseParser<TAuth, TRes>,
  txOptions: SuiTransactionBlockResponseOptions = {},
): NextApiHandler {
  return withZkLoginUserRequired(
    sui,
    catchAllDispatcher({
      tx: sponsoredTxHandler(gas, buildGaslessTx),
      exec: execHandler(sui, parseTxRes, txOptions),
    }),
  );
}
