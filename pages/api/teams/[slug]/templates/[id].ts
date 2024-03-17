import {
  throwIfNoTeamAccess,
} from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { deleteTemplate, getTemplate } from 'models/template';

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
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      // case 'POST':
      //   await handlePOST(req, res);
      //   break;
      //   case 'PUT':
      //     await handlePUT(req, res);
      //     break;
      // case 'PATCH':
      //   await handlePATCH(req, res);
      //   break;
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

// Get templates of a team
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_templates', 'read');

  const template = await getTemplate({id: req.query.id as string});

  recordMetric('template.fetched');

  res.status(200).json({ data: template });
};

// Delete a template from the team
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {

  await deleteTemplate({id: req.query.id as string});

  recordMetric('template.removed');

  res.status(200).json({ data: {} });
};