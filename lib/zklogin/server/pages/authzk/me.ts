/**
 * Copyright 2023-2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextApiHandler } from "next";
import { ZkLoginUser } from "../../../user";
import { CurrentEpochProvider } from "../../providers";
import { withZkLoginUserRequired } from "../session";
import { methodDispatcher } from "../utils";

const handler: NextApiHandler<ZkLoginUser> = (req, res) => {
  res.json(req.session.user!);
};

/**
 * Implements the me route.
 */
export function me(epochProvider: CurrentEpochProvider): NextApiHandler {
  return withZkLoginUserRequired(
    epochProvider,
    methodDispatcher({
      GET: handler,
    }),
  );
}
