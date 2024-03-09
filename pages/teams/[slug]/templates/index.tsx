import { Error, Loading } from '@/components/shared';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { TeamFeature } from 'types';
import { WithLoadingAndError } from '@/components/shared';
import { Button } from 'react-daisyui';
import { useRouter } from 'next/router';

const Templates = ({ teamFeatures }: { teamFeatures: TeamFeature }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { isLoading, isError, team } = useTeam();

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!team) {
    return <Error message={t('team-not-found')} />;
  }

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
      <h2 className="text-xl font-semibold mb-2">
        {t('email-templates')}
      </h2>
      <p className='text-sm'>{t('templates-placeholder')}
        </p> </div>
          <Button
            color="primary"
            size="md"
            onClick={() => router.push('/teams/[slug]/templates/create', `/teams/${team.slug}/templates/create`)}
          >
            {t('create-template')}
          </Button>
        </div>
        </div>

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

export default Templates;
