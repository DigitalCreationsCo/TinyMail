import { useTranslation } from 'next-i18next';
import { Team, Email } from '@prisma/client';
import Image from 'next/image';
import { Button } from 'react-daisyui';
import { useRouter } from 'next/router';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { useState } from 'react';

interface EmailsProps {
  emails: Email[];
  team: Team;
  removeEmail: (team: Team, email: Email) => void;
}

const Emails = ({ emails, team, removeEmail }: EmailsProps) => {
  const [askConfirmation, setAskConfirmation] = useState(false);
  const [email, setEmail] = useState<Email | null>(null);

  const { t } = useTranslation('common');
  const router = useRouter();

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold mb-2">{t('emails')}</h2>
        <Button
          color="primary"
          size="md"
          onClick={() =>
            router.push(
              '/teams/[slug]/emails/create',
              `/teams/${team.slug}/emails/create`
            )
          }
        >
          {t('create-email')}
        </Button>
      </div>

      <table className="table w-full text-sm border">
        <thead>
          <tr>
            <th></th>
            <th>ID</th>
            <th>{t('title')}</th>
            <th>{t('created-at')}</th>
            <th>{t('updated-at')}</th>
          </tr>
        </thead>
        <tbody>
          {emails.map((email) => (
            <tr
              className="cursor-pointer"
              key={email.id}
              onClick={() =>
                router.push(
                  '/teams/[slug]/emails[id]/edit',
                  `/teams/${team.slug}/emails/${email.id}/edit`
                )
              }
            >
              <td>
                <Image
                  src={decodeURIComponent(email.image as string)}
                  alt={email.title}
                  width={100}
                  height={100}
                />
              </td>
              <td>{email.id}</td>
              <td>{email.title}</td>
              <td>{new Date(email.createdAt).toLocaleDateString()}</td>
              <td>{new Date(email.updatedAt).toLocaleDateString()}</td>
              <td>
                <Button
                  color="error"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEmail(email);
                    setAskConfirmation(true);
                  }}
                >
                  {t('remove-email')}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmationDialog
        visible={askConfirmation}
        title={`${t('remove-email')} ${email?.title}`}
        onCancel={() => setAskConfirmation(false)}
        onConfirm={() => {
          if (team && email) {
            removeEmail(team, email);
            setEmail(null);
            setAskConfirmation(false);
          }
        }}
        confirmText={t('remove-email')}
      >
        {t('remove-email-confirmation')}
      </ConfirmationDialog>
    </div>
  );
};

export default Emails;
