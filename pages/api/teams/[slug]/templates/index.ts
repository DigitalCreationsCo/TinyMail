import { prisma } from '@/lib/prisma';
import { sendAudit } from '@/lib/retraced';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import {
  createTemplate,
  deleteTemplate,
  getTeamTemplates,
} from 'models/template';
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
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      case 'POST':
        await handlePOST(req, res);
        break;
      //   case 'PUT':
      //     await handlePUT(req, res);
      //     break;
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
  throwIfNotAllowed(teamMember, 'team_templates', 'read');

  const templates = await getTeamTemplates({ teamId: teamMember.team.id });

  recordMetric('template.fetched');

  res.status(200).json({ data: templates });
};

// Create a template for the team
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_templates', 'create');

  const { title, description, doc, templateFields, backgroundColor, image } =
    req.body as Prisma.TemplateCreateArgs['data'];

  const templateCreated = await createTemplate({
    title,
    description,
    doc,
    image,
    templateFields,
    backgroundColor,
    teamId: teamMember.team.id,
    authorId: teamMember.user.id,
  });

  sendAudit({
    action: 'template.create',
    crud: 'c',
    user: teamMember.user,
    team: teamMember.team,
  });

  recordMetric('template.created');

  res.status(200).json({ data: templateCreated });
};

// Delete a template from the team
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  // const teamMember = await throwIfNoTeamAccess(req, res);
  // throwIfNotAllowed(teamMember, 'team_templates', 'delete');

  const { templateId } = req.query as { templateId: string };

  await deleteTemplate({ id: templateId });

  // await sendEvent(teamMember.teamId, 'template.removed', templateRemoved);

  // sendAudit({
  //   action: 'template.remove',
  //   crud: 'd',
  //   user: teamMember.user,
  //   team: teamMember.team,
  // });

  recordMetric('template.removed');

  res.status(200).json({ data: {} });
};

// Update the template
const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_templates', 'update');

  const { id, title, description, doc, backgroundColor, image } =
    req.body as Prisma.TemplateUpdateArgs['data'];

  const templateUpdated = await prisma.template.update({
    where: {
      id: id as string,
    },
    data: {
      title,
      description,
      doc,
      backgroundColor,
      image,
    },
  });

  sendAudit({
    action: 'template.update',
    crud: 'u',
    user: teamMember.user,
    team: teamMember.team,
  });

  recordMetric('template.updated');

  res.status(200).json({ data: templateUpdated });
};
