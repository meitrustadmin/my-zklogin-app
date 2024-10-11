/**
 * Copyright 2023-2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextApiHandler } from "next";
import { intersection, record, string, type, validate } from "superstruct";
import { methodDispatcher } from "../utils";
import { jwtVerify } from "jose";
import { oidProviders } from "lib/zklogin/server/providers";
class ZkLoginAuthError extends Error {}
const CallbackData = intersection([
  type({
    state: string(),
  }),
  record(string(), string()),
]);

const postHandler: NextApiHandler = async (req, res) => {
  const [error, body] = validate(req.body, CallbackData);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  console.log('in authzk apple ' + JSON.stringify(body))

  const oidConfig = oidProviders['apple'];

  let jwtClaims;
  try {
    jwtClaims = (
      await jwtVerify(body.jwt, oidConfig.getKey, {
        requiredClaims: ["iss", "aud", "nonce", body.keyClaimName],
      })
    ).payload;
  } catch (e) {
    throw new ZkLoginAuthError("Bad jwt");
  }

  if (body.user) {
    //TODO: store the user in the database
    let user = JSON.parse(body.user);
    console.log('user email ' + user.email)
    console.log('user name ' + user.name)
    try {
      const response = await fetch('/api/recover/apple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          iss: jwtClaims.iss,
          aud: jwtClaims.aud,
          name: user.name?.name,
          first_name: user.name?.firstName,
          given_name: user.name?.givenName,
          email: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upsert Apple user');
      }

      const result = await response.json();
      console.log('Apple user upserted:', result);
    } catch (error) {
      console.error('Error upserting Apple user:', error);
      // You might want to handle this error more gracefully
    }
  }


  const callback = new URLSearchParams(body.state).get("callback");
  if (!callback) {
    res.status(400).json({ error: "Missing callback from state" });
    return;
  }

  res.redirect(303, `${callback}#${new URLSearchParams(body).toString()}`);
};

/**
 * This route translates an HTTP POST callback from Sign in with Apple to a client-side callback
 * where parameters are passed through URL fragment, same as the other providers.
 */
export const apple = methodDispatcher({ POST: postHandler });
