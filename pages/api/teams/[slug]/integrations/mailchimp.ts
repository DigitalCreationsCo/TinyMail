import { prisma } from '@/lib/prisma';
import { sendAudit } from '@/lib/retraced';
import {
  throwIfNoTeamAccess,
} from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { deleteMailChimpKey, getMailChimpKey } from 'models/integrations/mailchimp';

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
      case 'PUT':
        await handlePUT(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, DELETE, PUT');
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

// Get mailchimp key
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_integrations', 'read');

  const mailChimpKey = await getMailChimpKey(teamMember.user.id);

  recordMetric('integration.fetched');

  res.status(200).json({ data: mailChimpKey });
};

// Delete mailchimp key
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query as { id: string };

  await deleteMailChimpKey(id);

  recordMetric('integration.removed');

  res.status(200).json({ data: {} });
};

// Update the mailchimp key
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_integrations', 'update');

  const { id, mailchimpApiKey } = req.body as { id: string; mailchimpApiKey: string };

  const mailChimpKeyUpdate = await prisma.user.update({
    where: { id },
    data: {
      mailchimpApiKey,
    },
    select: {
        mailchimpApiKey: true,
    }
  });

  sendAudit({
    action: 'integration.mailchimp.update',
    crud: 'u',
    user: teamMember.user,
    team: teamMember.team,
  });

  recordMetric('integration.updated');

  res.status(200).json({ data: mailChimpKeyUpdate.mailchimpApiKey });
};
