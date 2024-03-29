import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const connectContent = async (param: Prisma.ContentCreateArgs['data']) => {
  const { title, description = "", source = "", contentFields = [], authorId = '', teamId = '' } = param;

  return await prisma.content.create({
    data: {
      title,
      description,
      source,
      contentFields,
      authorId,
      teamId,
    },
  });
};

export const getContent = async (key: { id: string }) => {
  return await prisma.content.findUnique({
    where: key,
  });
};

// export const getContentByTemplateId = async (key: { id: string }) => {
//   return await prisma.content.findUnique({
//     where: { te},
//   });
// };

export const getTeamContent = async (key: { teamId: string }) => {
  return await prisma.content.findMany({
    where: key,
    orderBy: {
      updatedAt: 'desc',
    }
  });
};

export const deleteContent = async (key: { id: string }) => {
  return await prisma.content.delete({
    where: key,
  });
};