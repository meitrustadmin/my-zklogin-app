
import { NextApiRequest, NextApiResponse } from 'next';
import { withZkLoginUserRequired } from 'lib/zklogin/server/pages';
import { sui } from 'lib/api/shinami';
import  prisma  from 'lib/prisma';
// const prisma = new PrismaClient();

export default withZkLoginUserRequired(sui, async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: any
) {
  if (req.method === 'POST') {
    try {
      const { multisigAddress, status } = req.body;

      if (!multisigAddress) {
        return res.status(400).json({ error: 'Multisig address is required' });
      }

      const query: any = {
        multisig_address: multisigAddress,
      };

      if (status) {
        query.status = status;
      }

      const passkeys = await prisma.passkey_users.findMany({
        where: {
            multisig_address: multisigAddress,
            //status: status,
        }
      });

      res.status(200).json(passkeys);
    } catch (error) {
      console.error('Error fetching passkeys:', error);
      res.status(500).json({ error: 'Error fetching passkeys' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
});
