/**
 * Copyright 2023-2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextApiHandler } from "next";
import { withSession } from "../session";
import { methodDispatcher } from "../utils";

const postHandler: NextApiHandler = (req, res) => {
  req.session.destroy();
  res.json({});
};

const getHandler: NextApiHandler = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

/**
 * Implements the logout route.
 */
export const logout = withSession(
  methodDispatcher({ POST: postHandler, GET: getHandler }),
);
