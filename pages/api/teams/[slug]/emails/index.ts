import { prisma } from '@/lib/prisma';
import { sendAudit } from '@/lib/retraced';
import {
  throwIfNoTeamAccess,
} from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { createEmail, deleteEmail, getTeamEmails } from 'models/email';

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
      case 'POST':
        await handlePOST(req, res);
        break;
      case 'PATCH':
        await handlePATCH(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, DELETE, POST, PATCH');
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

// Get emails of a team
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_emails', 'read');

  const emails = await getTeamEmails({teamId: teamMember.team.id });

  recordMetric('email.fetched');

  res.status(200).json({ data: emails });
};

// Create a email for the team
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_emails', 'create');

  const { title, description, content, backgroundColor, image } = req.body as { title: string; description: string; backgroundColor: string; content: string; image: string };

  const emailCreated = await createEmail({
    title, description, content, image, backgroundColor, teamId: teamMember.team.id, authorId: teamMember.user.id,
  });

  sendAudit({
    action: 'email.create',
    crud: 'c',
    user: teamMember.user,
    team: teamMember.team,
  });

  recordMetric('email.created');

  res.status(200).json({ data: emailCreated });
};

// Delete a email from the team
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query as { id: string };

  await deleteEmail({id});

  recordMetric('email.removed');

  res.status(200).json({ data: {} });
};

// Update the email
const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_emails', 'update');

  const { id, title, description, content, backgroundColor, image } = req.body as { title: string, description: string, content: string, image: string, id: string, backgroundColor: string};

  const emailUpdated = await prisma.email.update({
    where: {
      id,
    },
    data: {
      title,
      description,
      content,
      backgroundColor,
      image,
    },
  });

  sendAudit({
    action: 'email.update',
    crud: 'u',
    user: teamMember.user,
    team: teamMember.team,
  });

  recordMetric('email.updated');

  res.status(200).json({ data: emailUpdated });
};
