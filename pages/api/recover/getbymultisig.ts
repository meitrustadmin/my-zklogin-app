

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withZkLoginUserRequired } from 'lib/zklogin/server/pages/session';
import { SuiClient } from '@mysten/sui/client';
import prisma from 'lib/prisma';
import { sui } from 'lib/api/shinami';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { multisigAddress } = req.body;

  if (!multisigAddress || typeof multisigAddress !== 'string') {
    return res.status(400).json({ error: 'Invalid multisig address' });
  }

  try {
    const recoveries = await prisma.auth_recovery.findMany({
      where: {
        multisig_address: multisigAddress,
      },
    });

    return res.status(200).json(recoveries);
  } catch (error) {
    console.error('Error fetching recoveries:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withZkLoginUserRequired(sui, handler);

