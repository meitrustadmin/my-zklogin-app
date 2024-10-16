import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { NextApiRequest, NextApiResponse } from "next";
//import { login } from "lib/auth";
import prisma from "lib/prisma";
import { withZkLoginUserRequired } from "lib/zklogin/server/pages";
import { sui } from "lib/api/shinami";
import { PublicKeyCredentialWithAssertionJSON } from "@github/webauthn-json";
import type {
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
} from "@simplewebauthn/server";
import {
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { API_HOST, RPID } from "lib/api/move";

const HOST_SETTINGS = {
  expectedOrigin: API_HOST,
  expectedRPID: RPID
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const userId = await login(request);
    request.session.userId = userId;
    await request.session.save();

    response.json(userId);
  } catch (error) {
    console.error('login error: ' + error);
    response.status(500).json({ message: (error as Error).message });
  }
}

async function login(request: NextApiRequest) {
  const challenge = request.session.challenge ?? "";
  const credential = request.body
    .credential as PublicKeyCredentialWithAssertionJSON;
  const email = request.body.email;

  if (credential?.id == null) {
    throw new Error("Invalid Credentials");
  }

  const userCredential = await prisma.passkey_credentials.findUnique({
    select: {
      id: true,
      userId: true,
      externalId: true,
      publicKey: true,
      signCount: true,
      user: {
        select: {
          username: true,
        },
      },
    },
    where: {
      externalId: credential.id,
    },
  });

  if (userCredential == null) {
    throw new Error("Unknown User");
  }

  let verification: VerifiedAuthenticationResponse;
  try {
    verification = await verifyAuthenticationResponse({
      response: credential as any,
      expectedChallenge: challenge,
      authenticator: {
        credentialID: Buffer.from(userCredential.externalId),
        credentialPublicKey: userCredential.publicKey,
        counter: userCredential.signCount,
      },
      ...HOST_SETTINGS,
    });

    await prisma.passkey_credentials.update({
      data: {
        signCount: verification.authenticationInfo.newCounter,
      },
      where: {
        id: userCredential.id,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }

  // if (!verification.verified ||  !== userCredential.user.email) {
  //   throw new Error("Login verification failed");
  // }

  //console.log(`Logged in as user ${userCredential.userId}`);
  return userCredential.userId;
}

export default withZkLoginUserRequired(sui, handler);
