import { Error, Loading } from '@/components/shared';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Button } from 'react-daisyui';
import { useRouter } from 'next/router';
import { Editor } from '@tinymce/tinymce-react';
import { useRef, useState } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import { useFormik, validateYupSchema } from 'formik';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import html2canvas from 'html2canvas-pro';
import { useSession } from 'next-auth/react';
import type { ApiResponse } from 'types';
import '@/styles/editor.module.css';

import { defaultHeaders } from '@/lib/common';
import { Template } from '@prisma/client';
import { getTemplate } from 'models/template';
import EditTemplate from '@/components/templates/EditTemplate';

const schema = Yup.object().shape({
  title: Yup.string().required('Enter a title'),
  doc: Yup.string().required('Document is empty'),
});

const EditTemplatePage = ({
  apiKey,
  template,
}: {
  apiKey: string;
  template: Template;
}) => {
  const [templateFields, setTemplateFields] = useState<Set<string>>(
    new Set(template.templateFields)
  );
  const [isEditingField, setIsEditingField] = useState(false);

  const editor = useRef<Editor | null>(null);
  const router = useRouter();
  const { t } = useTranslation('common');

  const { team, isLoading, isError } = useTeam();
  const { data, status } = useSession();

  const formik = useFormik({
    initialValues: {
      title: template.title,
      description: template.description,
      backgroundColor: template.backgroundColor,
      templateFields: Array.from(templateFields),
      image: template.image,
      doc: template.doc,
      teamId: template.teamId,
      authorId: template.authorId,
    },
    onSubmit: async (values) => {
      const updateTemplate = {
        id: template.id,
        title: values.title,
        description: values.description,
        backgroundColor:
          editor.current?.editor?.getBody().style.backgroundColor ||
          values.backgroundColor,
        // take a screenshot of the editor content and save it as an image
        image: encodeURIComponent(
          await (
            await html2canvas(
              document.querySelector('#editor-window') as HTMLElement
            )
          ).toDataURL('image/png')
        ),
        doc: editor.current?.editor?.getContent() || values.doc,
        templateFields: values.templateFields,
        teamId: team!.id,
        authorId: data!.user.id,
      };

      validateYupSchema(updateTemplate, schema);

      const response = await fetch(`/api/teams/${team!.slug}/templates`, {
        method: 'PATCH',
        headers: defaultHeaders,
        body: JSON.stringify(updateTemplate),
      });

      const json = (await response.json()) as ApiResponse<Template[]>;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      toast.success(t('successfully-updated'));
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        formik.setFieldValue('doc', editor.current?.editor?.getContent());
        formik.setFieldValue('templateFields', Array.from(templateFields));
        formik.handleSubmit();
      }}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          {/* <h2 className="text-xl font-semibold mb-2">
          {t('create-template')}
        </h2> */}
          <div className="flex flex-row items-center space-x-2">
            <input
              name="title"
              className="p-2 min-w-32 w-fit"
              value={formik.values.title}
              onChange={formik.handleChange}
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
              disabled={!formik.dirty || !formik.isValid}
            >
              {t('save-template')}
            </Button>
          </div>
        </div>
        <EditTemplate
          editorRef={editor}
          apiKey={apiKey}
          initialValue={template.doc}
          templateFields={templateFields}
          setTemplateFields={setTemplateFields}
          isEditingField={isEditingField}
          setIsEditingField={setIsEditingField}
        />
      </div>
    </form>
  );
};

export async function getServerSideProps({
  locale,
  params,
}: GetServerSidePropsContext) {
  if (!env.tinyMCE.apiKey) {
    return {
      notFound: true,
    };
  }

  if (!params || !params.id) return { notFound: true };

  const template = await getTemplate({ id: params.id as string });
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      apiKey: env.tinyMCE.apiKey,
      template: JSON.parse(JSON.stringify(template)),
    },
  };
}

export default EditTemplatePage;
