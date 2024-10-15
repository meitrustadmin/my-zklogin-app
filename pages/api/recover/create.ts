import  prisma  from 'lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { withZkLoginUserRequired } from 'lib/zklogin/server/pages';
import { sui } from 'lib/api/shinami';

// const prisma = new PrismaClient();


export default withZkLoginUserRequired(sui, async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: any
) {
  if (req.method === 'POST') {
    try {
        //console.log('identifiers', req.body.identifiers);
      let identifiers = req.body.identifiers.map((m: any) => {
        return {
          provider: m.provider,
          identifier: m.identifier,
          iss: m.iss,
          aud: m.aud,
          key_claim_name: m.keyClaimName,
          key_claim_value: m.keyClaimValue,
          wallet: m.address,
          multisig_address: req.body.msAddress,
          //multisig_address_raw: 'mock',
          multisig_address_raw: req.body.msAddressRaw,
          email: m.email,
          name: m.name,
          index: m.index,
          create_at: new Date(),
          update_at: new Date(),
          status: 'ACTIVE'
        }
      });
      //console.log('identifiers', identifiers);
      // Insert one record
    //   const newRecovery = await prisma.auth_recovery.create({
    //     data: identifiers[0]
    //   });

      // If you want to return just the single created record
      //res.status(201).json(newRecovery);
      //return;
      const newRecoveries = await prisma.auth_recovery.createMany({
        data: identifiers,
      });

      res.status(201).json(newRecoveries);
    } catch (error) {
        console.log(JSON.stringify(error, null, 2));
      res.status(500).json({ error: 'Error creating recoveries' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
});
