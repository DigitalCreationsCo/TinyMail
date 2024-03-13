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
      content: '',
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
        content: editor.current?.editor?.getContent() || '',
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
            ref={editor}
            apiKey={apiKey}
            init={{
              branding: false,
              visualblocks_default_state: true,
              block_formats: 'Paragraph=p;Header 1=h1;Header 2=h2;Header 3=h3;Header 4=h4;Header 5=h5;Header 6=h6;',

              style_formats: [
                { title: 'Containers', items: [
                  { title: 'section', block: 'section', wrapper: true, merge_siblings: false, styles: { backgroundColor: '#cccccc'} },
                ] }
              ],
              style_formats_merge: true,

              autosave_ask_before_unload: true,
              // autosave_restore_when_empty: true,
              // autosave_interval: '20s',

              menubar: false,

              plugins: 'anchor autolink autosave charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed linkchecker a11ychecker permanentpen powerpaste advtable advcode editimage advtemplate ai mentions tableofcontents footnotes mergetags autocorrect typography inlinecss',
              toolbar: 'undo redo | blocks fontfamily fontsize forecolor backcolor blockColor backgroundColor | bold italic underline strikethrough | link image media table mergetags | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat output',


              setup: (editor) => {
                // add body in elementpath
                editor.ui.registry.addButton('output', {
                  text: 'Output',
                  onAction: () => {
                    // getall document nodes, output to the console
                    const content = editor.getContent();
                    console.log('Content: ', content)
                  },
                });

                editor.ui.registry.addButton('blockColor', {
                  icon: 'color-picker',
                  onAction: (api) => {
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
                  onAction: (api) => {
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
                        console.log('Color:', data.color);
                        // change color editor background
                        editor.getBody().style.backgroundColor = data.color;
                        api.close();
                      },
                    });
                  }
                });

              },

              mergetags_list: [
                { value: 'First.Name', title: 'First Name' },
                { value: 'Email', title: 'Email' },
              ],
              ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
            }}
            initialValue=""
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
