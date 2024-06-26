import { prisma } from '@/lib/prisma';
import { createHash, randomBytes } from 'crypto';

interface CreateApiKeyParams {
  name: string;
  userId: string;
  teamId: string;
}

export const hashApiKey = (apiKey: string) => {
  return createHash('sha256').update(apiKey).digest('hex');
};

export const generateUniqueApiKey = () => {
  const apiKey = randomBytes(16).toString('hex');

  return [hashApiKey(apiKey), apiKey];
};

export const createApiKey = async (params: CreateApiKeyParams) => {
  const { name, teamId, userId } = params;

  const [hashedKey, apiKey] = generateUniqueApiKey();

  await prisma.apiKey.create({
    data: {
      name,
      hashedKey: hashedKey,
      team: { connect: { id: teamId } },
      user: { connect: { id: userId } },
    },
  });

  return apiKey;
};

export const fetchApiKeys = async (teamId: string) => {
  return prisma.apiKey.findMany({
    where: {
      teamId,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });
};

export const deleteApiKey = async (id: string) => {
  return prisma.apiKey.delete({
    where: {
      id,
    },
  });
};

export const isApiKeyValid = async (apiKey: string) => {
  const apiKeyRecord = await prisma.apiKey.findUnique({
    where: {
      hashedKey: hashApiKey(apiKey),
    },
    select: {
      id: true,
    },
  });

  if (!apiKeyRecord) {
    return false;
  }

  return true;
};

export const getApiKey = async (apiKey: string) => {
  return prisma.apiKey.findUnique({
    where: {
      hashedKey: hashApiKey(apiKey),
    },
    select: {
      id: true,
      teamId: true,
      userId: true,
    },
  });
};
