import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import env from '@/lib/env';
import * as google from 'googleapis';
import { prisma } from '@/lib/prisma';

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

  const auth = new google.Auth.OAuth2Client({
    clientId: env.google.clientId,
    clientSecret: env.google.clientSecret,
    redirectUri: '/auth/google/callback',
  });

  const account = await prisma.account.findFirst({
    where: {
      userId: teamMember.user.id,
    },
    select: {
      access_token: true,
    },
  });

  if (!account || !account.access_token) {
    const auth_url = auth.generateAuthUrl({
      scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    return res.status(302).json({ auth_url });
  }

  const { access_token } = account;

  console.info('access_token', access_token);
  auth.setCredentials({ access_token });

  const { token } = await auth.getAccessToken();
  console.info('token', token);

  const sheets = new google.sheets_v4.Sheets({ auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: sheetName,
  });

  // fetch google sheet data
  // const sheet = await fetchGoogleSheet(teamMember.user.email!, sessionToken, sheetId, [], 'id', '1');
  // return sheet;

  // recordMetric('template.fetched');

  res.status(200).json(response.data);
};
