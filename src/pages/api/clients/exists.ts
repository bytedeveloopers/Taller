import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

const onlyDigits = (s = '') => s.replace(/\D/g, '');
const normalizeEmail = (s?: string) => (s ? s.trim().toLowerCase() : undefined);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  const phone = req.query.phone as string | undefined;
  const email = req.query.email as string | undefined;

  const match = await prisma.client.findFirst({
    where: {
      OR: [
        phone ? { phone: onlyDigits(phone) } : undefined,
        email ? { email: normalizeEmail(email) } : undefined,
      ].filter(Boolean) as any,
    },
    select: { id: true, name: true, phone: true, email: true },
  });

  return res.status(200).json({ exists: !!match, match });
}
