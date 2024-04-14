import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { deleteContent, getContent, updateContent } from 'models/content';
import { sendEvent } from '@/lib/svix';
import { sendAudit } from '@/lib/retraced';

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
      case 'PATCH':
        await handlePATCH(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, DELETE, PATCH');
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
  throwIfNotAllowed(teamMember, 'team_content', 'read');

  const content = await getContent({ id: req.query.id as string });

  recordMetric('content.fetched');

  res.status(200).json({ data: content });
};

// Delete a template from the team
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_content', 'delete');

  const { id } = req.query as { id: string };

  const contentRemoved = await deleteContent({ id });

  await sendEvent(teamMember.teamId, 'content.removed', contentRemoved);

  sendAudit({
    action: 'content.remove',
    crud: 'd',
    user: teamMember.user,
    team: teamMember.team,
  });

  recordMetric('content.removed');

  res.status(200).json({ data: {} });
};

// Update the content
const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_content', 'update');

  const {
    id,
    title,
    description,
    source,
    teamId,
    authorId,
    templateId,
    contentFields,
  } = req.body as any;

  const contentUpdated = await updateContent({
    id,
    update: {
      title,
      description,
      source,
      teamId,
      authorId,
      templateId,
      contentFields,
    },
  });

  sendAudit({
    action: 'content.update',
    crud: 'u',
    user: teamMember.user,
    team: teamMember.team,
  });

  recordMetric('content.updated');

  res.status(200).json({ data: contentUpdated });
};
