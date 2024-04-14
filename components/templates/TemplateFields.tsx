import classNames from 'classnames';
import { useState } from 'react';
import {
  XCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';

const TemplateFields = ({
  templateFields,
  editTemplateField,
  deleteTemplateField,
  currentField,
  setField,
  // isEditingField,
  setIsEditingField,
}: {
  templateFields: Set<string>;
  editTemplateField: any;
  deleteTemplateField: any;
  currentField?: string | null;
  setField?: (field: string | null) => void;
  isEditingField?: boolean;
  setIsEditingField?: (isEditingField: boolean) => void;
}) => {
  // const [current, setCurrent] = useState(-1);

  const { t } = useTranslation('common');

  return (
    <div>
      <p className="font-semibold">{t('template-fields')}</p>
      {Array.from(templateFields).map((field, index) => (
        <TemplateFieldButton
          key={`field-${field}-${index}`}
          // current={current}
          field={field}
          index={index}
          editTemplateField={editTemplateField}
          deleteTemplateField={deleteTemplateField}
          currentField={currentField}
          setField={setField}
          setIsEditingField={setIsEditingField}
        />
      ))}
    </div>
  );
};

export default TemplateFields;

const TemplateFieldButton = ({
  // current,
  field,
  // editTemplateField,
  deleteTemplateField,
  // index,
  currentField,
  setField,
  setIsEditingField,
}: {
  current?: number;
  field: string;
  index?: number;
  editTemplateField: any;
  deleteTemplateField: any;
  currentField?: string | null;
  setField?: (field: string | null) => void;
  setIsEditingField?: (isEditingField: boolean) => void;
}) => {
  const [reallyDelete, setReallyDelete] = useState(false);
  const deleteField = (field: string) => {
    if (reallyDelete) {
      deleteTemplateField(field);
      setReallyDelete(false);
    } else {
      document.addEventListener('click', () => {
        setReallyDelete(false);
      });
      setReallyDelete(true);
    }
  };
  return (
    <button
      className={classNames(
        'border p-2 rounded-full h-10',
        'flex flex-row items-center gap-x-2',
        currentField === field ? 'bg-blue-200' : 'bg-gray-100'
      )}
      onClick={(e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setField?.(field);
        setIsEditingField?.(true);
      }}
    >
      {field}
      {reallyDelete ? (
        <QuestionMarkCircleIcon
          className="w-6 h-6 text-red-400"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteField(field);
          }}
        />
      ) : (
        <XCircleIcon
          className="w-6 h-6 hover:text-red-400"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteField(field);
          }}
        />
      )}
    </button>
  );
};
