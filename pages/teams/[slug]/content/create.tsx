import { Error, Loading } from '@/components/shared';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Button } from 'react-daisyui';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useFormik, validateYupSchema } from 'formik';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useSession } from 'next-auth/react';
import type { ApiResponse } from 'types';
import '@/styles/editor.module.css';

import { defaultHeaders } from '@/lib/common';
import { ContentMap, ContentSource, Prisma, Template } from '@prisma/client';
import { getTeamTemplates } from 'models/template';
import { getTeamMember } from 'models/team';
import { getSession } from '@/lib/session';
import { throwIfNotAllowed } from 'models/user';
import {
  ChevronUpDownIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import GoogleSheetConnect, {
  ContentFieldMapper,
} from '@/components/shared/GoogleSheetConnect';
import { ContentFields } from 'types/content';

const schema = Yup.object().shape({
  title: Yup.string().required('Enter a title'),
  source: Yup.string().required('Select a source'),
});

const CreateContentPage = ({ templates }: { templates: Template[] }) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const [selectTemplate, setSelectTemplate] = useState<Template | null>(null);
  const [contentFields, setContentFields] = useState<ContentFields>([]);
  const [source, setSource] = useState<string>(t('connect-content-source'));
  const [sourceData, setSourceData] = useState<string[][] | null>(null);
  const [headerRowOrientation, setHeaderRowOrientation] = useState<
    'horizontal' | 'vertical'
  >('horizontal');

  const addContentField = (field: [string, string]) => {
    setContentFields([...contentFields, field]);
  };
  const removeContentField = (field: [string, string]) => {
    setContentFields(contentFields.filter((f) => f !== field));
  };
  const updateContentField = (field: [string, string], index: number) => {
    const newContentFields = [...contentFields];
    newContentFields[index] = field;
    setContentFields(newContentFields);
  };

  const formik = useFormik<Prisma.ContentMapCreateArgs['data']>({
    initialValues: {
      title: '',
      description: '',
      contentFields: [],
      source: undefined as any,
      templateId: '',
      teamId: '',
      authorId: '',
    },
    onSubmit: async () => {
      const saveContentMap: Prisma.ContentMapCreateArgs['data'] = {
        title: `${selectTemplate?.title}-content-map-${new Date().toISOString()}`,
        description: '',
        source: source as ContentSource,
        contentFields: contentFields.map(([key, value]) => `${key}:${value}`),
        templateId: selectTemplate!.id,
        teamId: team!.id,
        authorId: user.id,
      };

      validateYupSchema(saveContentMap, schema);

      const response = await fetch(`/api/teams/${team!.slug}/content`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(saveContentMap),
      });

      const json = (await response.json()) as ApiResponse<ContentMap[]>;
      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      toast.success(t('successfully-save-successful'));
      formik.resetForm();

      // redirect to the team content page
      router.push('/teams/[slug]/content', `/teams/${team!.slug}/content`);
    },
  });

  const { isLoading, isError, team } = useTeam();
  const { status: sessionStatus, data: sessionData } = useSession();
  const user = sessionData!.user;

  if (sessionStatus === 'loading' || !sessionData) {
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
        <div className="flex flex-col">
          <div className="flex flex-row justify-between items-center space-x-2">
            <h2 className="text-xl font-semibold mb-2">
              {t('connect-content-source')}
            </h2>
            {formik.isSubmitting && t('saving')}
            <p className="text-red-500">{Object.values(formik.errors)[0]}</p>
          </div>
        </div>
        <div className="dropdown">
          <div
            tabIndex={0}
            className="border border-gray-300 dark:border-gray-600 flex h-10 items-center px-4 justify-between cursor-pointer rounded text-sm font-bold"
          >
            <div className="flex items-center gap-2">
              <ArrowTopRightOnSquareIcon className="w-5 h-5" /> {source}
            </div>
            <ChevronUpDownIcon className="w-5 h-5" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content dark:border-gray-600 p-2 shadow-md bg-base-100 w-full rounded border px-2"
          >
            {[['Google Sheet', 'GOOGLE_SHEET']].map(([key, value]) => (
              <li key={`select-${key}`}>
                <button
                  type="button"
                  className="w-full flex hover:bg-gray-100 hover:dark:text-black focus:bg-gray-100 focus:outline-none py-2 px-2 rounded text-sm font-medium gap-2 items-center"
                  onClick={() => {
                    setSource(value);
                    if (document.activeElement) {
                      (document.activeElement as HTMLElement).blur();
                    }
                  }}
                >
                  {key}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {(source === 'GOOGLE_SHEET' && (
          <GoogleSheetConnect
            data={sourceData}
            setData={setSourceData}
            setHeaderRowOrientation={setHeaderRowOrientation}
            headerRowOrientation={headerRowOrientation}
          />
        )) || <></>}
        {(sourceData && sourceData.length && (
          <>
            <hr className="my-2" />
            <ContentFieldMapper
              templates={templates}
              selectTemplate={selectTemplate}
              setSelectTemplate={setSelectTemplate}
              contentFields={contentFields}
              headerRowOrientation={headerRowOrientation}
              updateContentField={updateContentField}
              addContentField={addContentField}
              removeContentField={removeContentField}
              data={sourceData}
            />
          </>
        )) || <></>}
        <hr />
        <div className="flex flex-row justify-end items-center space-x-2">
          {formik.isSubmitting && t('saving')}
          <p className="text-red-500">{Object.values(formik.errors)[0]}</p>
          <Button
            type="submit"
            color="primary"
            size="md"
            loading={formik.isSubmitting}
            // disabled={!formik.dirty || !formik.isValid}
          >
            {t('save-content')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export async function getServerSideProps({
  locale,
  req,
  res,
  query,
}: GetServerSidePropsContext) {
  if (!env.tinyMCE.apiKey) {
    return {
      notFound: true,
    };
  }

  const session = await getSession(req, res);
  const teamMember = await getTeamMember(
    session?.user.id as string,
    query.slug as string
  );

  try {
    throwIfNotAllowed(teamMember, 'team_templates', 'read');

    const templates = await getTeamTemplates({ teamId: teamMember.teamId });
    return {
      props: {
        ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
        teamFeatures: env.teamFeatures,
        templates: JSON.parse(JSON.stringify(templates)),
      },
    };
  } catch (error: unknown) {
    const { message } = error as { message: string };
    return {
      props: {
        ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
        error: {
          message,
        },
        teamFeatures: env.teamFeatures,
      },
    };
  }
}

export default CreateContentPage;
