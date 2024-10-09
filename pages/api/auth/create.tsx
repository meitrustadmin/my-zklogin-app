import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { NextApiRequest, NextApiResponse } from "next";
//import { register } from "lib/auth";
import { withZkLoginUserRequired } from "lib/zklogin/server/pages";
import { sui } from "lib/api/shinami";
import prisma from "lib/prisma";
import type {
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
} from "@simplewebauthn/server";
import {
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type {
  PublicKeyCredentialWithAssertionJSON,
  PublicKeyCredentialWithAttestationJSON,
} from "@github/webauthn-json";

const HOST_SETTINGS = {
  expectedOrigin: API_HOST,
  expectedRPID: RPID
};

import { API_HOST, RPID } from "lib/api/move";
import crypto from "crypto";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    console.log('RPID', JSON.stringify(RPID))
    const user = await register(request);
    request.session.userId = user.id;
    await request.session.save();

    response.json({ userId: user.id });
  } catch (error: unknown) {
    console.error((error as Error).message);
    response.status(500).json({ message: (error as Error).message });
  }
}

async function register(request: NextApiRequest) {
  const challenge = request.body.challenge
  const credential = request.body.credential as PublicKeyCredentialWithAttestationJSON;
  const { displayname, username } = request.body;

  let verification: VerifiedRegistrationResponse;

  if (credential == null) {
    throw new Error("Invalid Credentials");
  }

  try {
    verification = await verifyRegistrationResponse({
      response: credential as any,
      expectedChallenge: challenge,
      requireUserVerification: true,
      ...HOST_SETTINGS,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }

  if (!verification.verified) {
    throw new Error("Registration verification failed");
  }

  const { credentialID, credentialPublicKey } =
    verification.registrationInfo ?? {};

  if (credentialID == null || credentialPublicKey == null) {
    throw new Error("Registration failed");
  }

  const user = await prisma.passkey_users.create({
    data: {
      username,
      displayname,
      credentials: {
        create: {
          externalId: clean(binaryToBase64url(Buffer.from(credentialID))),
          publicKey: Buffer.from(credentialPublicKey),
        },
      },
    },
  });

 // console.log(`Registered new user ${user.id}`);
  return user;
}

function clean(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function binaryToBase64url(bytes: Uint8Array) {
  let str = "";

  bytes.forEach((charCode) => {
    str += String.fromCharCode(charCode);
  });

  return btoa(str);
}

export function generateChallenge() {
  return clean(crypto.randomBytes(32).toString("base64"));
}

export default withZkLoginUserRequired(sui, handler);
