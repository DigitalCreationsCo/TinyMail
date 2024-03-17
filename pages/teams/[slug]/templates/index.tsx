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
import Templates from '@/components/templates/Templates';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';
import toast from 'react-hot-toast';
import { Template } from '@prisma/client';

const TemplatesPage = () => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { team } = useTeam();
  const { data, isLoading, error, mutate } = useSWR(
    team?.slug ? `/api/teams/${team?.slug}/templates` : null,
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

  const templates = data?.data || [];

  const removeTemplate = async (team, template: Template) => {
    const response = await fetch(`/api/teams/${team.slug}/templates?templateId=${template.id}`, {
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
      {canAccess('team_templates', ['read', 'create', 'delete', 'update']) && (
        <div className="space-y-3">
          <Templates templates={templates} team={team} removeTemplate={removeTemplate}/>
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

export default TemplatesPage;
