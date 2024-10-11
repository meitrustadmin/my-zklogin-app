


import { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { iss, aud, sub } = req.query;

    if (!iss || !aud || !sub) {
      return res.status(400).json({ message: 'Missing required query parameters' });
    }

    const user = await prisma.apple_user.findUnique({
      where: {
        unique_iss_aud_sub: {
          iss: iss as string,
          aud: aud as string,
          sub: sub as string,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching Apple user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
