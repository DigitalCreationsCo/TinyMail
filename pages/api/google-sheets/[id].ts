import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSheetData, fetchGoogleSheet } from '@/lib/google-sheet';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGET(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Get a google sheet data
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_content', 'read');

  const { id, sheetName } = req.query as { id: string; sheetName: string };
  if (!id || !sheetName) {
    return res
      .status(400)
      .json({ error: 'Sheet ID and Sheet Name are required' });
  }

  const sheetId = id as string;

  const sheet = (await fetchGoogleSheet({
    req,
    res,
    userId: teamMember.user.id,
    sheetId,
    range: sheetName,
  })) as GoogleSheetData;

  res.status(200).json(sheet);
};
