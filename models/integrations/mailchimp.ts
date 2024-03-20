import { prisma } from '@/lib/prisma';

export const getMailChimpKey = async (id: string) => {
    return await prisma.user.findFirst({
      where: { id },
      select: {
        mailchimpApiKey: true
      }
    });
  };

export const saveMailChimpKey = async (userId: string, mailchimpApiKey: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
        mailchimpApiKey
    },
  });
};

export const deleteMailChimpKey = async (userId: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { 
        mailchimpApiKey: null
    }
  });
};