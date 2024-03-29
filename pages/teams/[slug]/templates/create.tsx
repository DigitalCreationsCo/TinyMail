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
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import html2canvas from 'html2canvas-pro';
import { useSession } from 'next-auth/react';
import type { ApiResponse } from 'types';
import '@/styles/editor.module.css';

import { defaultHeaders } from '@/lib/common';
import { Template } from '@prisma/client';

const schema = Yup.object().shape({
  title: Yup.string().required('Enter a title'),
});

const CreateTemplate = ({ apiKey }: { apiKey: string }) => {
  const [title, setTitle] = useState('New Template');
  const editor = useRef<Editor | null>(null)

  const router = useRouter();
  const { t } = useTranslation('common');
  const { isLoading, isError, team } = useTeam();
  const { status, data } = useSession();

  const user = data!.user;

  const formik = useFormik({
    initialValues: {
      title,
      description: '',
      image: '',
      doc: '',
      teamId: '',
      authorId: '',
    },
    validationSchema: schema,
    onSubmit: async () => {
      const saveTemplate = {
        title,
        description: '',
        // take a screenshot of the editor content and save it as an image
        image: encodeURIComponent(await (await html2canvas(document.querySelector('#editor-window') as HTMLElement)).toDataURL('image/png')),
        doc: editor.current?.editor?.getContent() || '',
        backgroundColor: editor.current?.editor?.getBody().style.backgroundColor || '',
        teamId: team!.id,
        authorId: user.id,
      }

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
        <input className='p-2 w-[300px]' value={title} onChange={(e) => setTitle(e.target.value)} />
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
        <div id="editor-window">

          <Editor
            initialValue=""
            ref={editor}
            apiKey={apiKey}
            init={{

              formats: {
                h1: { block: 'h1', classes: 'h1' },
                h2: { block: 'h2', classes: 'h2' },
                h3: { block: 'h3', classes: 'h3' },
                p: { block: 'p', classes: 'p' },
                a: { selector: 'a', classes: 'a' },
              },

              content_css: '/styles/editor.css',
              content_style: "body {max-width: 600px; margin-left: auto; margin-right: auto;} h1 { font-size: 60pt; margin: 0, padding: 0; }",

              branding: false,
              visualblocks_default_state: false,
              block_formats: 'Paragraph=p;Header 1=h1;Header 2=h2;Header 3=h3;Header 4=h4;Header 5=h5;Header 6=h6;',
              font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt 60pt',

              style_formats: [
                { title: 'Contners', items: [
                  { title: 'section', block: 'section', wrapper: true, merge_siblings: false, styles: { backgroundColor: '#cccccc'} },
                ] }
              ],
              style_formats_merge: true,

              autosave_ask_before_unload: true,
              // autosave_restore_when_empty: true,
              // autosave_interval: '20s',

              menubar: false,

              plugins: 'anchor autolink autosave charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount      linkchecker               ',
              toolbar: 'undo redo | blocks fontfamily fontsize forecolor backcolor blockColor backgroundColor | bold italic underline strikethrough | link image media table  | align lineheight |  numlist bullist indent outdent | emoticons charmap | removeformat output',

              _list: [
                { value: 'First.Name', title: 'First Name' },
                { value: 'Eml', title: 'Eml' },
              ],
              _request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement  Assistant")),

              setup: (editor) => {
                // add body in elementpath
                editor.ui.registry.addButton('output', {
                  text: 'Output',
                  onAction: () => {
                    // getall document nodes, output to the console
                    const doc = editor.getContent();
                    console.log('doc: ', doc)
                  },
                });

                editor.ui.registry.addButton('blockColor', {
                  icon: 'color-picker',
                  onAction: () => {
                    editor.windowManager.open({
                      title: 'Choose a color',
                      body: {
                        type: 'panel',
                        items: [
                          {
                            type: 'colorinput',
                            name: 'color',
                            label: 'Background color',
                          },
                        ],
                      },
                      buttons: [
                        {
                          type: 'cancel',
                          name: 'cancel',
                          text: 'Cancel',
                        },
                        {
                          type: 'submit',
                          name: 'submit',
                          text: 'Save',
                          primary: true,
                        },
                      ],
                      initialData: { color: '#ffffff' },
                      onSubmit: (api) => {
                        const data = api.getData();
                        // change color of selected block
                        const selection = editor.selection;
                        const selectedBlock = selection.getNode();
                        if (selectedBlock) {
                          selectedBlock.style.backgroundColor = data.color;
                        }
                        api.close();
                      },
                    });
                  }
                });

                editor.ui.registry.addButton('backgroundColor', {
                  icon: 'cell-background-color',
                  onAction: () => {
                    editor.windowManager.open({
                      title: 'Choose a color',
                      body: {
                        type: 'panel',
                        items: [
                          {
                            type: 'colorinput',
                            name: 'color',
                            label: 'Background color',
                          },
                        ],
                      },
                      buttons: [
                        {
                          type: 'cancel',
                          name: 'cancel',
                          text: 'Cancel',
                        },
                        {
                          type: 'submit',
                          name: 'submit',
                          text: 'Save',
                          primary: true,
                        },
                      ],
                      initialData: { color: '#ffffff' },
                      onSubmit: (api) => {
                        const data = api.getData();
                        // change color editor background
                        editor.getBody().style.backgroundColor = data.color;
                        api.close();
                      },
                    });
                  }
                });

              },
            }}
          />
        </div>
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
