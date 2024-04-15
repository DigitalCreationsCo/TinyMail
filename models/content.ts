import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const connectContent = async (
  params: Prisma.ContentMapCreateArgs['data']
) => {
  const {
    title,
    description,
    source,
    sourceId,
    sourceRange,
    headerOrientation,
    contentFields,
    templateId = '',
    authorId = '',
    teamId = '',
  } = params;

  return await prisma.contentMap.create({
    data: {
      title,
      description,
      source,
      sourceId,
      sourceRange,
      headerOrientation,
      contentFields,
      templateId,
      authorId,
      teamId,
    },
  });
};

export const getContent = async (key: { id: string }) => {
  return await prisma.contentMap.findUnique({
    where: key,
  });
};

// export const getContentByTemplateId = async (key: { id: string }) => {
//   return await prisma.contentMap.findUnique({
//     where: { te},
//   });
// };

export const getTeamContent = async (key: { teamId: string }) => {
  return await prisma.contentMap.findMany({
    where: key,
    orderBy: {
      updatedAt: 'desc',
    },
  });
};

export const updateContent = async ({
  id,
  update,
}: {
  id: string;
  update: Prisma.ContentMapUpdateArgs['data'];
}) => {
  return await prisma.contentMap.update({
    where: { id },
    data: update,
  });
};

export const deleteContent = async (key: { id: string }) => {
  return await prisma.contentMap.delete({
    where: key,
  });
};
