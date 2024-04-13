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
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';
import toast from 'react-hot-toast';
import { Content } from '@prisma/client';
import Contents from '@/components/content/Contents';

const ContentPage = () => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { team } = useTeam();
  const { data, isLoading, error, mutate } = useSWR(
    team?.slug ? `/api/teams/${team?.slug}/content` : null,
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

  const content = data?.data || [];

  const removeContent = async (team, content: Content) => {
    const response = await fetch(
      `/api/teams/${team.slug}/content?id=${content.id}`,
      {
        method: 'DELETE',
        headers: defaultHeaders,
      }
    );

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
      {canAccess('team_content', ['read', 'create', 'delete', 'update']) && (
        <div className="space-y-3">
          <Contents
            contents={content}
            team={team}
            // connectContent={connectContent}
            removeContent={removeContent}
          />
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

export default ContentPage;

/**
 * TEMPLATE MAP NOTES:
 * If you change the field names of your source content, you will need to change them in TinyMail as well.
 *
 */
