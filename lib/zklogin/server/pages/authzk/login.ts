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
  console.log('jwt ' + JSON.stringify(body.jwt))
  const oidConfig = oidProviders[body.oidProvider];

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
  let email = ''
  if (jwtClaims.email) {
    email = jwtClaims.email as string 
  }
  console.log('email ' + email)
  let picture = 'https://abs.twimg.com/sticky/default_profile_images/default_profile.png'
  if (jwtClaims.picture) {
    picture = jwtClaims.picture as string
  }
  console.log('picture ' + picture)
  let name = ''
  if (jwtClaims.name) {
    name = jwtClaims.name as string
  }
  console.log('name ' + name)
  let given_name = ''
  if (jwtClaims.given_name) {
    given_name = jwtClaims.given_name as string
  }
  console.log('given_name ' + given_name)
  let family_name = ''
  if (jwtClaims.family_name) {
    family_name = jwtClaims.family_name as string
  }
  const email_verified = jwtClaims.email_verified
  //console.log('email_verified ' + email_verified)
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

  const recoveries = await checkAuthRecoveryExists([identifier.toBase64()])
  let multisig_address = ''
  if (recoveries.length === 1) {
    multisig_address = recoveries[0].multisig_address
  }
  //console.log('in login ' + JSON.stringify(recoveries))
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
    multisig_address: multisig_address,
    identifier: identifier.toBase64(),
    addressSeed: addressSeed,
    email: email as string,
    picture: picture as string,
    name: name as string,
    given_name: given_name as string,
    family_name: family_name as string,
    iss: iss,
    zkProof: { ...partialProof, addressSeed },
  };
}

// function toPkIdentifier(addressSeed: string, iss: string): ZkLoginPublicIdentifier {
//     // const addressSeed = genAddressSeed(
//     //     BigInt(account.userSalt),
//     //     'sub',
//     //     account.sub,
//     //     account.aud,
//     // ).toString();
//     console.log('address seed ' + BigInt(addressSeed))
//     console.log('iss ' +  iss)
//     let pk = toZkLoginPublicIdentifier(
//         BigInt(addressSeed),
//         iss,
//     )
//     console.log(pk)
//     return pk;
// }

// function toZkLoginPublicIdentifier(
// 	addressSeed: bigint,
// 	iss: string,
// ): ZkLoginPublicIdentifier {
// 	// Consists of iss_bytes_len || iss_bytes || padded_32_byte_address_seed.
// 	const addressSeedBytesBigEndian = toPaddedBigEndianBytes(addressSeed, 32);
//     console.log(addressSeed)
//     console.log(JSON.stringify(iss))
// 	const issBytes = new TextEncoder().encode(iss);
// 	const tmp = new Uint8Array(1 + issBytes.length + addressSeedBytesBigEndian.length);
// 	tmp.set([issBytes.length], 0);
// 	tmp.set(issBytes, 1);
// 	tmp.set(addressSeedBytesBigEndian, 1 + issBytes.length);
//     //console.log(new TextDecoder().decode(tmp))
// 	return new ZkLoginPublicIdentifier(tmp);
// }

// export function toPaddedBigEndianBytes(num: bigint, width: number): Uint8Array {
// 	const hex = num.toString(16);
// 	return hexToBytes(hex.padStart(width * 2, '0').slice(-width * 2));
// }

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
