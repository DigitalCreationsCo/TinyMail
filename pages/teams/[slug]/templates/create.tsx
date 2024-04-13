import { Error, Loading } from '@/components/shared';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Button } from 'react-daisyui';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import html2canvas from 'html2canvas-pro';
import { useSession } from 'next-auth/react';
import type { ApiResponse } from 'types';
import '@/styles/editor.module.css';

import { defaultHeaders } from '@/lib/common';
import { Prisma, Template } from '@prisma/client';
import { Editor } from '@tinymce/tinymce-react';
import EditorComponent from '@/components/Editor';
import EditTemplate from '@/components/templates/EditTemplate';

const schema = Yup.object().shape({
  title: Yup.string().required('Enter a title'),
});

const CreateTemplate = ({ apiKey }: { apiKey: string }) => {
  const [title, setTitle] = useState('New Template');
  const [templateFields, setTemplateFields] = useState([]);

  const router = useRouter();
  const { t } = useTranslation('common');
  const { isLoading, isError, team } = useTeam();
  const { status, data } = useSession();

  const user = data!.user;

  const editor = useRef<Editor | null>(null);

  const formik = useFormik<Prisma.TemplateCreateArgs['data']>({
    initialValues: {
      title,
      description: '',
      backgroundColor: '',
      templateFields: [],
      image: '',
      doc: '',
      teamId: '',
      authorId: '',
    },
    validationSchema: schema,
    onSubmit: async () => {
      const saveTemplate: Prisma.TemplateCreateArgs['data'] = {
        title,
        description: '',
        // take a screenshot of the editor content and save it as an image
        image: encodeURIComponent(
          await (
            await html2canvas(
              document.querySelector('#editor-window') as HTMLElement
            )
          ).toDataURL('image/png')
        ),
        doc: editor.current?.editor?.getContent() || '',
        templateFields,
        backgroundColor:
          editor.current?.editor?.getBody().style.backgroundColor || '',
        teamId: team!.id,
        authorId: user.id,
      };

      const response = await fetch(`/api/teams/${team!.slug}/templates`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(saveTemplate),
      });

      const json = (await response.json()) as ApiResponse<Template[]>;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      toast.success(t('successfully-save-successful'));
      formik.resetForm();

      // redirect to the team templates page
      router.push('/teams/[slug]/templates', `/teams/${team!.slug}/templates`);
    },
  });

  if (status === 'loading' || !data) {
    return null;
  }

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
    <form onSubmit={formik.handleSubmit}>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          {/* <h2 className="text-xl font-semibold mb-2">
          {t('create-template')}
        </h2> */}
          <div className="flex flex-row items-center space-x-2">
            <input
              className="p-2 w-[300px]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <PencilIcon className="w-5 h-5 text-secondary" />
          </div>
          <div>
            {formik.isSubmitting && t('saving')}
            <Button
              type="submit"
              color="primary"
              size="md"
              loading={formik.isSubmitting}
              // disabled={!formik.dirty || !formik.isValid}
            >
              {t('save-template')}
            </Button>
          </div>
        </div>
        <EditTemplate
          editorRef={editor}
          apiKey={apiKey}
          templateFields={templateFields}
          setTemplateFields={setTemplateFields}
        />
      </div>
    </form>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  if (!env.tinyMCE.apiKey) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      apiKey: env.tinyMCE.apiKey,
    },
  };
}

export default CreateTemplate;
