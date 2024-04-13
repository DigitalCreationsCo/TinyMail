import { useState } from 'react';
import EditorComponent from '../Editor';
import TemplateFields from './TemplateFields';

export default function EditTemplate({
  editorRef,
  apiKey,
  initialValue = '',
  templateFields,
  setTemplateFields,
}: {
  editorRef: any;
  apiKey: string;
  initialValue?: string;
  templateFields: string[];
  setTemplateFields: any;
}) {
  const [currentField, setField] = useState<string | null>(null);

  function editTemplateField(previousField: string, field: string) {
    const index = templateFields.indexOf(previousField);
    if (index === -1) {
      setTemplateFields((prevFields) => [...prevFields, field]);
    } else {
      // overwrite the prvioues index
      setTemplateFields((prevFields) => {
        const newFields = [...prevFields];
        newFields[index] = field;
        return newFields;
      });
    }
  }

  function deleteTemplateField(field: string) {
    setTemplateFields((prevFields: string[]) => {
      return prevFields.filter((f) => f !== field);
    });
  }

  return (
    <div id="editor-window" className="space-y-2">
      <EditorComponent
        initialValue={initialValue}
        editorRef={editorRef}
        apiKey={apiKey}
        currentField={currentField}
        setField={setField}
        editTemplateField={editTemplateField}
        deleteTemplateField={deleteTemplateField}
      />
      <TemplateFields
        currentField={currentField}
        setField={setField}
        templateFields={templateFields}
        editTemplateField={editTemplateField}
        deleteTemplateField={deleteTemplateField}
      />
    </div>
  );
}
