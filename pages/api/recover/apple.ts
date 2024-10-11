

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import prisma from 'lib/prisma';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { iss, aud, name, first_name, given_name, email } = req.body;

    if (!iss || !aud) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const upsertedUser = await prisma.apple_user.upsert({
      where: {
        unique_iss_aud: {
          iss,
          aud,
        },
      },
      update: {
        name,
        first_name,
        given_name,
        email,
        update_at: new Date(),
      },
      create: {
        iss,
        aud,
        name,
        first_name,
        given_name,
        email,
      },
    });

    res.status(200).json(upsertedUser);
  } catch (error) {
    console.error('Error upserting Apple user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
