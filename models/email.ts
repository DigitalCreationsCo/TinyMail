import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const createEmail = async (param: Prisma.EmailCreateArgs['data']) => {
  const {
    title,
    description = '',
    backgroundColor = '',
    doc,
    image = '',
    authorId = '',
    teamId = '',
  } = param;

  return await prisma.email.create({
    data: {
      title,
      description,
      doc,
      authorId,
      backgroundColor,
      teamId,
      image,
    },
  });
};

export const getEmail = async (key: { id: string }) => {
  return await prisma.email.findUnique({
    where: key,
  });
};

export const getTeamEmails = async (key: { teamId: string }) => {
  return await prisma.email.findMany({
    where: key,
    orderBy: {
      updatedAt: 'desc',
    },
  });
};

export const deleteEmail = async (key: { id: string }) => {
  return await prisma.email.delete({
    where: key,
  });
};
