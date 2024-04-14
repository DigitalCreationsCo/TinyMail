import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import EditorComponent from '../Editor';
import TemplateFields from './TemplateFields';

export default function EditTemplate({
  editorRef,
  apiKey,
  initialValue = '',
  templateFields,
  setTemplateFields,
  isEditingField,
  setIsEditingField,
}: {
  editorRef: any;
  apiKey: string;
  initialValue?: string;
  templateFields: Set<string>;
  setTemplateFields: Dispatch<SetStateAction<Set<string>>>;
  isEditingField: boolean;
  setIsEditingField: Dispatch<SetStateAction<boolean>>;
}) {
  const [currentField, setField] = useState<string | null>(null);

  useEffect(() => {}, [templateFields]);

  function editTemplateField(previousField: string, field: string) {
    setTemplateFields((prevFields) => {
      if (prevFields.has(previousField) && !prevFields.has(field)) {
        console.info('overwriting field');
        const fields = Array.from(prevFields);
        const index = fields.indexOf(previousField);
        fields[index] = field;
        return new Set(fields);
      } else if (!prevFields.has(previousField) && !prevFields.has(field)) {
        console.info('adding new field');
        return new Set(prevFields).add(field);
      } else if (!prevFields.has(field)) {
        console.info('adding new field');
        return new Set(prevFields).add(field);
      } else {
        return new Set(prevFields);
      }
    });
  }

  function deleteTemplateField(field: string) {
    setTemplateFields((prevFields) => {
      const fields = Array.from(prevFields);
      const index = fields.indexOf(field);
      fields.splice(index, 1);
      return new Set(fields);
    });
  }

  return (
    <div id="editor-window" className="space-y-2">
      <EditorComponent
        templateFields={templateFields}
        initialValue={initialValue}
        editorRef={editorRef}
        apiKey={apiKey}
        currentField={currentField}
        setCurrentField={setField}
        editTemplateField={editTemplateField}
        isEditingField={isEditingField}
        setIsEditingField={setIsEditingField}
      />
      <TemplateFields
        currentField={currentField}
        setField={setField}
        templateFields={templateFields}
        editTemplateField={editTemplateField}
        deleteTemplateField={deleteTemplateField}
        isEditingField={isEditingField}
        setIsEditingField={setIsEditingField}
      />
    </div>
  );
}
