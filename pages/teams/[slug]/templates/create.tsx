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

const CreateTemplate = ({ teamFeatures }: { teamFeatures: TeamFeature }) => {
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
    <>
      <div className="space-y-3">
      <h2 className="text-xl font-semibold mb-2">
        {t('create-template')}
      </h2>
         
      </div>
    </>
  );
};

export default CreateTemplate;
