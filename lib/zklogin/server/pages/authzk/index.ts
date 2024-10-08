/**
 * Copyright 2023-2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextApiHandler } from "next";
import {
  CurrentEpochProvider,
  OAuthApplications,
  SaltProvider,
  UserAuthorizer,
  ZkProofProvider,
} from "../../providers";
import { catchAllDispatcher, withInternalErrorHandler } from "../utils";
import { apple } from "./apple";
import { login } from "./login";
import { logout } from "./logout";
import { me } from "./me";

/**
 * Implements auth API routes.
 *
 * By default, you should use this handler in file `pages/api/auth/[...api].ts`, which will expose
 * API routes at `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/apple`. If you
 * wish to install this under another API route, you must set env `NEXT_PUBLIC_AUTH_API_BASE`.
 *
 * @param epochProvider Function to fetch the current epoch number. Can also use a `SuiClient`.
 * @param saltProvider Function to fetch the wallet salt. Can also use a `ZkWalletClient`.
 * @param zkProofProvider Function to generate a zkProof. Can also use a `ZkProverClient`.
 * @param allowedApps OAuth application ids allowed for login.
 *    Should generally match the ids used on your login page.
 * @param authorizeUser Function that decides if an OpenID user is authorized to access your app.
 *    The user's JWT has already been verified by this point, but you can impose custom rules,
 *    potentially from consulting another data source. You can also return any info to enrich the
 *    user's auth context, which can be consumed by your frontend pages or API routes.
 *    Returning `undefine` will reject the login request.
 * @returns API handler for various auth sub-routes.
 */
export function authHandler(
  epochProvider: CurrentEpochProvider,
  saltProvider: SaltProvider,
  zkProofProvider: ZkProofProvider,
  allowedApps: OAuthApplications,
  authorizeUser: UserAuthorizer = () => ({}),
): NextApiHandler {
  return withInternalErrorHandler(
    catchAllDispatcher({
      login: login(
        epochProvider,
        saltProvider,
        zkProofProvider,
        allowedApps,
        authorizeUser,
      ),
      logout,
      me: me(epochProvider),
      apple,
    }),
  );
}
