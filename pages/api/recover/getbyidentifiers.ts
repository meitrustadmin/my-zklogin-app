import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import  prisma  from 'lib/prisma';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { identifiers } = req.body;

    if (!identifiers) {
      return res.status(400).json({ message: 'Identifier and status are required' });
    }

    const record = await prisma.auth_recovery.findMany({
      where: {
        identifier: {
          in: identifiers
        },
        status: 'ACTIVE'
      },
    });

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.status(200).json(record);
  } catch (error) {
    console.error('Error retrieving record:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
