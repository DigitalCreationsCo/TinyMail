import classNames from 'classnames';
import { useState } from 'react';
import {
  XCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

const TemplateFields = ({
  templateFields,
  editTemplateField,
  deleteTemplateField,
  currentField,
  setField,
}: {
  templateFields: string[];
  editTemplateField: (field: string) => void;
  deleteTemplateField: (field: string) => void;
  currentField?: string | null;
  setField?: (field: string | null) => void;
}) => {
  const [current, setCurrent] = useState(-1);
  return (
    <div>
      <p className="font-semibold">Template Fields</p>
      {templateFields.map((field, index) => {
        return (
          <TemplateFieldButton
            current={current}
            key={index}
            index={index}
            field={field}
            editTemplateField={editTemplateField}
            deleteTemplateField={deleteTemplateField}
            currentField={currentField}
            setField={setField}
          />
        );
      })}
    </div>
  );
};

export default TemplateFields;

const TemplateFieldButton = ({
  current,
  field,
  editTemplateField,
  deleteTemplateField,
  index,
  currentField,
  setField,
}: {
  current: number;
  field: string;
  index: number;
  editTemplateField: any;
  deleteTemplateField: any;
  currentField?: string | null;
  setField?: (field: string | null) => void;
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
        current === index ? 'bg-blue-200' : 'bg-gray-100'
      )}
      onClick={(e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setField?.(field);
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
