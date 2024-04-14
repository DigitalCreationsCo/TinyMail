import { sendAudit } from '@/lib/retraced';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { connectContent, getTeamContent } from 'models/content';
import { Prisma } from '@prisma/client';

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
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST');
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

// Get content maps of a team
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_content', 'read');

  const contents = await getTeamContent({ teamId: teamMember.team.id });

  recordMetric('content.fetched');

  res.status(200).json({ data: contents });
};

// Create a content map bind to a template
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_content', 'create');

  const { title, description, source, templateId, contentFields } =
    req.body as Prisma.ContentMapCreateArgs['data'];

  const contentCreated = await connectContent({
    title,
    description,
    source,
    templateId: templateId || '',
    contentFields,
    teamId: teamMember.team.id,
    authorId: teamMember.user.id,
  });

  sendAudit({
    action: 'content.create',
    crud: 'c',
    user: teamMember.user,
    team: teamMember.team,
  });

  recordMetric('content.created');

  res.status(200).json({ data: contentCreated });
};
