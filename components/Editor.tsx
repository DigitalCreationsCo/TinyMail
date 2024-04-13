/* eslint-disable react-hooks/exhaustive-deps */
import { Template } from '@prisma/client';
import { Editor } from '@tinymce/tinymce-react';
import { MutableRefObject, Ref, useEffect } from 'react';

export default function EditorComponent({
  editorRef,
  apiKey,
  initialValue = '',
  template,
  editTemplateField,
  deleteTemplateField,
  currentField,
  setField,
}: {
  editorRef: MutableRefObject<Editor | null>;
  apiKey: string;
  template?: Template;
  initialValue?: string;
  editTemplateField?: any;
  deleteTemplateField?: any;
  currentField?: string | null;
  setField?: (field: string | null) => void;
}) {
  // useEffect(() => {
  //   if (currentField) {
  //     // get element by id
  //     const element = (
  //       editorRef.current?.editor?.dom.select(
  //         `#${currentField}`
  //       ) as HTMLElement[]
  //     )[0];
  //     // open editTemplateField dialog
  //     editorRef.current?.editor?.windowManager.open({
  //       title: 'Edit Template Field',
  //       body: {
  //         type: 'panel',
  //         items: [
  //           {
  //             type: 'input',
  //             name: 'id',
  //             label: 'Field ID',
  //           },
  //         ],
  //       },
  //       buttons: [
  //         {
  //           type: 'cancel',
  //           name: 'cancel',
  //           text: 'Cancel',
  //         },
  //         {
  //           type: 'submit',
  //           name: 'submit',
  //           text: 'Save',
  //           primary: true,
  //         },
  //       ],
  //       initialData: { id: '' },
  //       onSubmit: (api) => {
  //         const data = api.getData();
  //         // add id attribute to selected block
  //         editTemplateField?.(element.id, data.id);
  //         element.id = data.id;
  //         api.close();
  //       },
  //     });
  //     setField?.(null);
  //   }
  // }, [
  //   currentField,
  //   setField,
  //   // editorRef, editTemplateField
  // ]);

  // useEffect(() => {}, [deleteTemplateField]);
  return (
    <>
      <Editor
        initialValue={initialValue || template?.doc || ''}
        ref={editorRef}
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
          content_style:
            'body {max-width: 600px; margin-left: auto; margin-right: auto;} h1 { font-size: 60pt; margin: 0, padding: 0; }',

          branding: false,
          visualblocks_default_state: true,
          block_formats:
            'Paragraph=p;Header 1=h1;Header 2=h2;Header 3=h3;Header 4=h4;Header 5=h5;Header 6=h6;',
          font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt 60pt',

          style_formats: [
            {
              title: 'Contners',
              items: [
                {
                  title: 'section',
                  block: 'section',
                  wrapper: true,
                  merge_siblings: false,
                  styles: { backgroundColor: '#cccccc' },
                },
              ],
            },
          ],
          style_formats_merge: true,

          autosave_ask_before_unload: true,
          // autosave_restore_when_empty: true,
          // autosave_interval: '20s',

          menubar: false,

          plugins:
            'anchor autolink autosave charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount      linkchecker               ',
          toolbar:
            'undo redo | blocks fontfamily fontsize forecolor backcolor blockColor backgroundColor | bold italic underline strikethrough | addTemplateField link image media table  | align lineheight |  numlist bullist indent outdent | emoticons charmap | removeformat output',

          _list: [
            { value: 'First.Name', title: 'First Name' },
            { value: 'Eml', title: 'Eml' },
          ],
          _request: (request, respondWith) =>
            respondWith.string(() =>
              Promise.reject('See docs to implement  Assistant')
            ),

          setup: (editor) => {
            editor.on('init', () => {
              editor.getBody().style.backgroundColor =
                template?.backgroundColor || '';
            });

            editor.ui.registry.addButton('output', {
              text: 'Output',
              onAction: () => {
                // getall document nodes, output to the console
                const doc = editor.getContent();
                console.log('doc: ', doc);
              },
            });

            // add a button to add specific id attributes to elements
            // open a dialog to add an id attribute to the selected block
            editor.ui.registry.addButton('addTemplateField', {
              icon: 'template-field',
              onAction: () => {
                editor.windowManager.open({
                  title: 'Add Template Field',
                  body: {
                    type: 'panel',
                    items: [
                      {
                        type: 'input',
                        name: 'id',
                        label: 'Field ID',
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
                  initialData: { id: '' },
                  onSubmit: (api) => {
                    const data = api.getData();
                    // add id attribute to selected block
                    const selection = editor.selection;
                    const selectedBlock = selection.getNode();
                    console.info('selection: ', selectedBlock.id, data.id);
                    // if (selectedBlock.id !== data.id) {
                    // }
                    editTemplateField?.(selectedBlock.id, data.id);
                    selectedBlock.id = data.id;
                    api.close();
                  },
                });
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
              },
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
              },
            });
          },
        }}
      />
    </>
  );
}
