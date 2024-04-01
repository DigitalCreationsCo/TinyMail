import { useTranslation } from 'next-i18next';
import { Team, Content } from '@prisma/client';
import { Button } from 'react-daisyui';
import { useRouter } from 'next/router';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { useState } from 'react';
import ConnectContentDialog from '../shared/ConnectContentDialog';

interface ContentProps {
  contents: Content[];
  team: Team;
  removeContent: (team: Team, content: Content) => void;
}

const Contents = ({ contents, team, removeContent }: ContentProps) => {
  const [askConfirmation, setAskConfirmation] = useState(false);
  const [openConnectContentDialog, setOpenConnectContentDialog] = useState(false);
  const [content, setContent] = useState<Content | null>(null);

  const { t } = useTranslation('common');
  const router = useRouter();

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {t('content')}
          </h2>
          <p>{t('connect-content-source')}</p>
          </div>
  
         <Button
            color="primary"
            size="md"
            onClick={() => setOpenConnectContentDialog(true)}
          >
            {t('connect-content')}
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
          {contents.map((content) => (
            <tr className="cursor-pointer" key={content.id} onClick={() => router.push('/teams/[slug]/contents[id]/edit', `/teams/${team.slug}/contents/${content.id}/edit`)}>
              <td>{content.id}</td>
              <td>{content.title}</td>
              <td>{new Date(content.createdAt).toLocaleDateString()}</td>
              <td>{new Date(content.updatedAt).toLocaleDateString()}</td>
              <td>
              <Button
                color="error"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setContent(content);
                  setAskConfirmation(true);
                }}>
                  {t('remove-content')}
              </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmationDialog
        visible={askConfirmation}
        title={`${t('remove-content')} ${content?.title}`}
        onCancel={() => setAskConfirmation(false)}
        onConfirm={() => {
          if (team && content) {
            removeContent(team, content);
            setContent(null);
            setAskConfirmation(false);
          }
        }}
        confirmText={t('remove-content')}
      >
        {t('remove-content-confirmation')}
      </ConfirmationDialog>
      
      <ConnectContentDialog
        confirmText={t('connect-content')}
        visible={openConnectContentDialog}
        onCancel={() => setOpenConnectContentDialog(false)}
        onConfirm={() => {}}
      />
    </div>
  );
};

export default Contents;
