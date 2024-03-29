import toast from 'react-hot-toast';
import { Button } from 'react-daisyui';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';

import { Card } from '@/components/shared';
import { Team, User } from '@prisma/client';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';
import MailChimpDialog from '../shared/MailChimpDialog';
import mailchimpAPi from '@mailchimp/mailchimp_transactional';

interface MailchimpProps { 
  apiKey: string
  team: Team
  user: User
}

const Mailchimp = ({ team, user, apiKey: _key }: MailchimpProps) => {
  const [apiKey, setApiKey] = useState(_key || '');
  const [askConfirmation, setAskConfirmation] = useState(false);

  const showOpacityActive = _key?.length > 0 ? 1 : 0.5;
  const { t } = useTranslation('common');

  const connectMailChimp = async () => {

    if (!apiKey || apiKey.length === 0) {
      throw new Error('mailchimp-api-key-required');
    }

    try {
      const mailchimp = mailchimpAPi(apiKey);
      const pingResponse = await mailchimp.users.ping();

      if (pingResponse!== 'PONG!') {
        throw new Error(t('mailchimp-api-key-invalid'));
      }

    const response = await fetch(
      `/api/teams/${team.slug}/integrations/mailchimp`,
      {
        body: JSON.stringify({ id: user.id, mailchimpApiKey: apiKey }),
        method: 'PUT',
        headers: defaultHeaders,
        credentials: 'same-origin',
      }
    );

    const result = (await response.json()) as ApiResponse<{ url: string }>;

    if (!response.ok) {
      throw new Error(result.error.message);
    }

      console.log(response);
      toast(t('mailchimp-connected'))
      window.location.reload();
    } catch (error: any) {
      console.info('error: ', error);
      toast.error(error.message);
      throw new Error(error.message);
    }
  };

  return (
    <>
    <Card>
      <Card.Body>
        <div>
          <Button
            type="button"
            variant="link"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAskConfirmation(true);
            }}
          >
          {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mailchimp.png" alt={t('mailchimp')} width='auto' style={{ opacity: showOpacityActive, backgroundColor: 'transparent'}} />
          </Button>
        </div>
      </Card.Body>
    </Card>
      <MailChimpDialog
        apiKey={apiKey}
        setApiKey={setApiKey}
        visible={askConfirmation}
        onCancel={() => {
          setAskConfirmation(false);
          setApiKey(_key);
        }}
        onConfirm={connectMailChimp}
      />
    </>
  );
};

export default Mailchimp;
