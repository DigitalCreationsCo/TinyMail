import { Error, Loading } from '@/components/shared';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { TeamFeature } from 'types';
import { WithLoadingAndError } from '@/components/shared';
import { Button } from 'react-daisyui';
import { useRouter } from 'next/router';
import { Editor } from '@tinymce/tinymce-react';

const CreateTemplate = ({ apiKey }: { apiKey: string }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
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
      <div className="space-y-3">
      <div className="flex justify-between items-center">

        <h2 className="text-xl font-semibold mb-2">
          {t('create-template')}
        </h2>
        <Button
            color="primary"
            size="md"
            onClick={() => {
              // save template in prisma database
              

              // redirect to the team templates page
              router.push('/teams/[slug]/templates', `/teams/${team.slug}/templates`);

            }}
          >
            {t('save-template')}
          </Button>
        </div>
        <div className="editor-window">

          <Editor
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

              plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed linkchecker a11ychecker tinymcespellchecker permanentpen powerpaste advtable advcode editimage advtemplate ai mentions tinycomments tableofcontents footnotes mergetags autocorrect typography inlinecss',
              toolbar: 'output blockColor backcolor undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
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
                        // editor.execCommand('mceBlockColor', false, data.color);
                        console.log('Color:', data.color);
                        // change color editor background
                        // editor.getBody().style.backgroundColor = data.color;


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

              },

              tinycomments_mode: 'embedded',
              tinycomments_author: 'Author name',
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
    </>
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
