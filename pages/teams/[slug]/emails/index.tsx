import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import { Error, Loading } from '@/components/shared';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { WithLoadingAndError } from '@/components/shared';
import useCanAccess from 'hooks/useCanAccess';
import Emails from '@/components/emails/Emails';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';
import toast from 'react-hot-toast';
import { Email } from '@prisma/client';

const EmailsPage = () => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { team } = useTeam();
  const { data, isLoading, error, mutate } = useSWR(
    team?.slug ? `/api/teams/${team?.slug}/emails` : null,
    fetcher
  );

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error.message} />;
  }

  if (!team) {
    return <Error message={t('team-not-found')} />;
  }

  const emails = data?.data || [];

  const removeEmail = async (team, email: Email) => {
    const response = await fetch(`/api/teams/${team.slug}/emails?id=${email.id}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });

    const json = (await response.json()) as ApiResponse;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    toast.success(t('leave-team-success'));
    mutate();
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={error}>
      {canAccess('team_emails', ['read', 'create', 'delete', 'update']) && (
        <div className="space-y-3">
        <Emails emails={emails} team={team} removeEmail={removeEmail}/>
        </div>
      )}
    </WithLoadingAndError>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default EmailsPage;
