
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import  prisma  from 'lib/prisma';
import { sui } from "lib/api/shinami";
import { withZkLoginUserRequired } from "lib/zklogin/server/pages";


async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username } = req.body;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    const user = await prisma.passkey_users.findUnique({
      where: { username },
      select: { id: true, username: true, createdAt: true, updatedAt: true },
    });

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}

export default withZkLoginUserRequired(sui, handler);

