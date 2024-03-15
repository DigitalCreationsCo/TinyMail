import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const createTemplate = async (param: Prisma.TemplateCreateArgs['data']) => {
  const { title, description = "", backgroundColor = "", content, image = "", authorId = '', teamId = '' } = param;

  return await prisma.template.create({
    data: {
      title,
      description,
      content,
      authorId,
      backgroundColor,
      teamId,
      image
    },
  });
};

export const getTemplate = async (key: { id: string }) => {
  return await prisma.template.findUnique({
    where: key,
  });
};

export const getTeamTemplates = async (key: { teamId: string }) => {
  return await prisma.template.findMany({
    where: key,
    orderBy: {
      updatedAt: 'desc',
    }
  });
};

export const deleteTemplate = async (key: { id: string }) => {
  return await prisma.template.delete({
    where: key,
  });
};