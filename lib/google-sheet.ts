import env from './env';
import * as google from 'googleapis';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export async function fetchGoogleSheet({
  req,
  res,
  userId,
  sheetId,
  range,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
  userId: string;
  sheetId: string;
  range: string;
}): Promise<GoogleSheetData | void> {
  try {
    const auth = new google.Auth.OAuth2Client({
      clientId: env.google.clientId,
      clientSecret: env.google.clientSecret,
      redirectUri: '/auth/google/callback',
    });

    const account = await prisma.account.findFirst({
      where: {
        userId,
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
    auth.setCredentials({ access_token });

    const sheets = new google.sheets_v4.Sheets({ auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });
    return response.data as GoogleSheetData;
  } catch (error: any) {
    console.error('The API returned an error:', error);
    throw new Error(error.message);
  }
}

export interface GoogleSheetData {
  range: string;
  majorDimension: string;
  values: string[][];
}
