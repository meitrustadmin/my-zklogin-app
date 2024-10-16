/**
 * Copyright 2023-2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  computeZkLoginAddress,
  genAddressSeed,
  generateNonce,
} from "@mysten/zklogin";
import { ZkLoginPublicIdentifier, toZkLoginPublicIdentifier } from '@mysten/sui/zklogin'
import { withIronSessionApiRoute } from "iron-session/next";
import { jwtVerify } from "jose";
import { NextApiHandler, NextApiRequest } from "next";
import { validate } from "superstruct";
import {
  JwtClaims,
  ZkLoginRequest,
  ZkLoginUser,
  ZkLoginUserId,
} from "../../../user";
import { first, publicKeyFromBase64 } from "../../../utils";
import {
  CurrentEpochProvider,
  OAuthApplications,
  SaltProvider,
  UserAuthorizer,
  ZkProofProvider,
  getCurrentEpoch,
  getSalt,
  getZkProof,
  oidProviders,
} from "../../providers";
import { sessionConfig } from "../session";
import { methodDispatcher } from "../utils";
import { hexToBytes } from '@noble/hashes/utils';
import { checkAuthRecoveryExists } from "utils";
import { API_HOST } from "lib/api/move";

class ZkLoginAuthError extends Error {}


async function getExpires(
  req: NextApiRequest,
  epochProvider: CurrentEpochProvider,
  allowedApps: OAuthApplications,
): Promise<Date> {
  const [error, body] = validate(req.body, ZkLoginRequest, { mask: true });
  if (error) throw new ZkLoginAuthError(error.message);

  const apps = allowedApps[body.oidProvider];
  if (!apps || apps.length === 0)
    throw new ZkLoginAuthError(`OpenID provider disabled: ${body.oidProvider}`);

  const { epoch, epochStartTimestampMs, epochDurationMs } =
    await getCurrentEpoch(epochProvider);
  const validEpochs = body.maxEpoch - epoch + 1;
  if (validEpochs <= 0) throw new ZkLoginAuthError("maxEpoch expired");

  // An approximation of maxEpoch end time. Doesn't have to be precise.
  return new Date(epochStartTimestampMs + epochDurationMs * validEpochs);
}

async function getZkLoginUser<T>(
  req: NextApiRequest,
  saltProvider: SaltProvider,
  zkProofProvider: ZkProofProvider,
  allowedApps: OAuthApplications,
  authorizeUser: UserAuthorizer<T>,
): Promise<ZkLoginUser<T>> {
  const [error, body] = validate(req.body, ZkLoginRequest);
  if (error) throw new ZkLoginAuthError(error.message);
  //console.log('zklogin user body ' + JSON.stringify(body))
  const oidConfig = oidProviders[body.oidProvider];
  //console.log('oidConfig ' + JSON.stringify(oidConfig))
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

  if (
    jwtClaims.nonce !==
    generateNonce(
      publicKeyFromBase64(body.extendedEphemeralPublicKey),
      body.maxEpoch,
      body.jwtRandomness,
    )
  )
    throw new ZkLoginAuthError("Invalid jwt nonce");

  const iss = jwtClaims.iss!;
  //TODO: check if the apple, need to get user is already in the database
  let email = ''
  if (jwtClaims.email) {
    email = jwtClaims.email as string 
  }
  //console.log('email ' + email)
  let picture = 'https://abs.twimg.com/sticky/default_profile_images/default_profile.png'
  if (jwtClaims.picture) {
    picture = jwtClaims.picture as string
  }
  //console.log('picture ' + picture)
  let name = ''
  if (jwtClaims.name) {
    name = jwtClaims.name as string
  }
  if (jwtClaims.preferred_username) { 
    name = jwtClaims.preferred_username as string
  }
 // console.log('name ' + name)
  let given_name = ''
  if (jwtClaims.given_name) {
    given_name = jwtClaims.given_name as string
  }
  //console.log('given_name ' + given_name)
  let family_name = ''
  if (jwtClaims.family_name) {
    family_name = jwtClaims.family_name as string
  }
  // Call Apple API to get user
  // let appleUser;
  // if (body.oidProvider === 'apple') {
  //   try {
  //     const response = await fetch(`${API_HOST}/api/recover/appleget`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         iss,
  //         aud: jwtClaims.aud,
  //         sub: jwtClaims.sub,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to get Apple user');
  //     }

  //     appleUser = await response.json();
  //     console.log('Apple user retrieved:', appleUser);

  //     // Update email and name if they were empty and are provided by Apple
  //     if (!email && appleUser.email) {
  //       email = appleUser.email;
  //     }
  //     if (!name && appleUser.name) {
  //       name = appleUser.name;
  //     }
  //   } catch (error) {
  //     console.error('Error getting Apple user:', error);
  //     // You might want to handle this error more gracefully
  //   }
  // }
  const aud = first(jwtClaims.aud)!;
  const keyClaimValue = jwtClaims[body.keyClaimName] as string;
  const id: ZkLoginUserId = {
    iss,
    aud,
    keyClaimName: body.keyClaimName,
    keyClaimValue,
  };

  if (!(allowedApps[body.oidProvider] ?? []).includes(aud))
    throw new ZkLoginAuthError("OAuth app not allowed");

  const authContext = await authorizeUser(
    body.oidProvider,
    id,
    jwtClaims as JwtClaims,
    body.extras,
  );
  if (authContext === undefined)
    throw new ZkLoginAuthError("User not authorized");
  
  const salt = await getSalt(saltProvider, {
    jwt: body.jwt,
    keyClaimName: body.keyClaimName,
    subWallet: 0, // TODO - expose additional sub-wallets.
  });
  const wallet = computeZkLoginAddress({
    claimName: body.keyClaimName,
    claimValue: keyClaimValue,
    iss,
    aud,
    userSalt: salt,
  });
  const addressSeed = genAddressSeed(
    salt,
    body.keyClaimName,
    keyClaimValue,
    aud,
  ).toString();

  const identifier = toZkLoginPublicIdentifier(BigInt(addressSeed), iss);
  let multisig_address = ''
  // const recoveries = await checkAuthRecoveryExists([identifier.toBase64()])
  
  // if (recoveries.length === 1) {
  //   multisig_address = recoveries[0].multisig_address
  // }
  // console.log('in login ' + JSON.stringify(recoveries))
  // console.log('multisig_address ' + multisig_address)
  const partialProof = await getZkProof(zkProofProvider, {
    jwt: body.jwt,
    ephemeralPublicKey: publicKeyFromBase64(body.extendedEphemeralPublicKey),
    maxEpoch: body.maxEpoch,
    jwtRandomness: BigInt(body.jwtRandomness),
    salt,
    keyClaimName: body.keyClaimName,
  });

  return {
    id,
    oidProvider: body.oidProvider,
    jwtClaims: jwtClaims as JwtClaims,
    authContext,
    maxEpoch: body.maxEpoch,
    wallet,
    identifier: identifier.toBase64(),
    addressSeed: addressSeed,
    email: email as string,
    picture: picture as string,
    name: name as string,
    iss: iss,
    zkProof: { ...partialProof, addressSeed },
  };
}

function loginHandler(
  epochProvider: CurrentEpochProvider,
  saltProvider: SaltProvider,
  zkProofProvider: ZkProofProvider,
  allowedApps: OAuthApplications,
  authorizeUser: UserAuthorizer,
): NextApiHandler {
  return withIronSessionApiRoute(
    async (req, res) => {
      // Skip if already responded which implies we failed to get expires
      if (res.headersSent) return;

      try {
        req.session.user = await getZkLoginUser(
          req,
          saltProvider,
          zkProofProvider,
          allowedApps,
          authorizeUser,
        );
      } catch (e) {
        if (!(e instanceof ZkLoginAuthError)) throw e;
        return res.status(400).json({ error: e.message });
      }

      await req.session.save();
      res.json(req.session.user);
    },
    async (req, res) => {
      let expires;
      try {
        expires = await getExpires(req, epochProvider, allowedApps);
      } catch (e) {
        if (!(e instanceof ZkLoginAuthError)) throw e;
        res.status(400).json({ error: e.message });
        return sessionConfig;
      }

      return {
        ...sessionConfig,
        cookieOptions: {
          ...sessionConfig.cookieOptions,
          expires,
          maxAge: Math.floor((expires.getTime() - new Date().getTime()) / 1000),
        },
      };
    },
  );
}

/**
 * Implements the login route.
 */
export function login(
  epochProvider: CurrentEpochProvider,
  saltProvider: SaltProvider,
  zkProofProvider: ZkProofProvider,
  allowedApps: OAuthApplications,
  authorizeUser: UserAuthorizer,
): NextApiHandler {
  return methodDispatcher({
    POST: loginHandler(
      epochProvider,
      saltProvider,
      zkProofProvider,
      allowedApps,
      authorizeUser,
    ),
  });
}
