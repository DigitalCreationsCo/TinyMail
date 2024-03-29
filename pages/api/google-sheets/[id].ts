import {
    throwIfNoTeamAccess,
  } from 'models/team';
  import { throwIfNotAllowed } from 'models/user';
  import type { NextApiRequest, NextApiResponse } from 'next';
  import { recordMetric } from '@/lib/metrics';
import { fetchGoogleSheet } from '@/lib/google-sheet';
import { getCookie } from 'cookies-next';
import { sessionTokenCookieName } from '@/lib/nextAuth';
import * as sheetsApi from '@googleapis/sheets';
import env from '@/lib/env';
import * as google from 'googleapis';

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
  
    const { id } = req.query;
    const sheetId = id as string;

    const sessionToken = getCookie(sessionTokenCookieName, { req, res }) as string;


    // const auth = new sheetsApi.auth.OAuth2({
    //   clientId: env.google.clientId,
    //   clientSecret: env.google.clientSecret,
    // })

    // auth.generateAuthUrl({
    //     access_type: 'offline',
    //     scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    // })
    const oauth2Client = new google.Auth.OAuth2Client(
      env.google.clientId,
      env.google.clientSecret
    );
    
    // set auth as a global default
    const sheets = new google.sheets_v4.Sheets({ auth: oauth2Client });

    // const sheets = sheetsApi.sheets({ version: 'v4', auth });

    // Get data from the Google Sheet
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Sheet1', // Change 'Sheet1' to the name of your sheet
    });
    console.info('response', response.data)

    // fetch google sheet data
    const sheet = await fetchGoogleSheet(teamMember.user.email!, sessionToken, sheetId, [], 'id', '1');
    return sheet;

    // recordMetric('template.fetched');
  
    res.status(200).json({ data: sheet });
  };
  