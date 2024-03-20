import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import useCanAccess from 'hooks/useCanAccess';
import { TeamTab } from '@/components/team';
import { Error, Loading } from '@/components/shared';
import Mailchimp from '@/components/integrations/Mailchimp';
import { getSession } from '@/lib/session';
import { getUserBySession } from 'models/user';

const IntegrationsPage = ({ teamFeatures, user }) => {
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
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
      {canAccess('team_integrations', ['read']) && (
        <>
          <TeamTab
            activeTab="integrations"
            team={team}
            teamFeatures={teamFeatures}
          />

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <div className="space-y-3">
                    <h2 className="text-xl font-medium leading-none tracking-tight">
                        {t('integrations')}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('integrations-description')}
                    </p>
                    </div>
                </div>


                <div className="grid gap-6 grid-cols-4">
                    <Mailchimp team={team} user={user} apiKey={user.mailchimpApiKey} />
                </div>
            </div>
          {/* <ProductPricing plans={plans} subscriptions={subscriptions} /> */}
        </>
      )}
    </>
  );
};

export async function getServerSideProps({
  locale, req, res
}: GetServerSidePropsContext) {
  if (!env.teamFeatures.integrations) {
    return {
      notFound: true,
    };
  }

  const session = await getSession(req, res);
  const user = await getUserBySession(session);

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      user: JSON.parse(JSON.stringify(user)),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default IntegrationsPage;
