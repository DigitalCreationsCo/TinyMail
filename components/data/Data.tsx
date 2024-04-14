import { useTranslation } from 'next-i18next';
import { Team, Template } from '@prisma/client';
import Image from 'next/image';
import { Button } from 'react-daisyui';
import { useRouter } from 'next/router';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { useState } from 'react';

interface TemplatesProps {
  templates: Template[];
  team: Team;
  removeTemplate: (team: Team, template: Template) => void;
}

const Templates = ({ templates, team, removeTemplate }: TemplatesProps) => {
  const [askConfirmation, setAskConfirmation] = useState(false);
  const [template, setTemplate] = useState<Template | null>(null);

  const { t } = useTranslation('common');
  const router = useRouter();

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold mb-2">{t('email-templates')}</h2>
        <Button
          color="primary"
          size="md"
          onClick={() =>
            router.push(
              '/teams/[slug]/templates/create',
              `/teams/${team.slug}/templates/create`
            )
          }
        >
          {t('create-template')}
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
          {templates.map((template) => (
            <tr
              className="cursor-pointer"
              key={template.id}
              onClick={() =>
                router.push(
                  '/teams/[slug]/templates[id]/edit',
                  `/teams/${team.slug}/templates/${template.id}/edit`
                )
              }
            >
              <td>
                <Image
                  src={decodeURIComponent(template.image as string)}
                  alt={template.title}
                  width={100}
                  height={100}
                />
              </td>
              <td>{template.id}</td>
              <td>{template.title}</td>
              <td>{new Date(template.createdAt).toLocaleDateString()}</td>
              <td>{new Date(template.updatedAt).toLocaleDateString()}</td>
              <td>
                <Button
                  color="error"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTemplate(template);
                    setAskConfirmation(true);
                  }}
                >
                  {t('remove-template')}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmationDialog
        visible={askConfirmation}
        title={`${t('remove-template')} ${template?.title}`}
        onCancel={() => setAskConfirmation(false)}
        onConfirm={() => {
          if (team && template) {
            removeTemplate(team, template);
            setTemplate(null);
            setAskConfirmation(false);
          }
        }}
        confirmText={t('remove-template')}
      >
        {t('remove-template-confirmation')}
      </ConfirmationDialog>
    </div>
  );
};

export default Templates;
