import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import { Dispatch, SetStateAction, useState } from 'react';
import InputWithLabel from './InputWithLabel';
import type { ApiResponse } from 'types';
import toast from 'react-hot-toast';
import { GoogleSheetData } from '@/lib/google-sheet';
import { ContentFields } from './ConnectContentDialog';
import {
  ChevronUpDownIcon,
  XCircleIcon,
  LinkIcon,
  QuestionMarkCircleIcon,
  PlusIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { Template } from '@prisma/client';

export default function GoogleSheetConnect({
  data,
  setData,
  setHeaderRowOrientation,
  headerRowOrientation,
}: {
  data: string[][] | null;
  setData: Dispatch<SetStateAction<string[][] | null>>;
  setHeaderRowOrientation: Dispatch<SetStateAction<'horizontal' | 'vertical'>>;
  headerRowOrientation: 'horizontal' | 'vertical';
}) {
  const { t } = useTranslation('common');
  const [sheetId, setSheetId] = useState('');
  const [sheetName, setSheetName] = useState('');

  async function connectGoogleSheet() {
    if (!sheetId) {
      toast.error(t('google-sheet-id-required'));
      return;
    }

    if (!sheetName) {
      toast.error(t('google-sheet-name-required'));
      return;
    }

    const response = await fetch(
      `/api/google-sheets/${sheetId}?sheetName=${sheetName}`
    );

    if (!response.ok) {
      const json = (await response.json()) as ApiResponse;
      toast.error(json.error.message);
      return;
    }

    if (response.status === 302) {
      const json = (await response.json()) as ApiResponse<{ auth_url: string }>;
      window.location.href = json.data.auth_url;
      return;
    }

    const data: GoogleSheetData = await response.json();
    setData(data.values);
  }
  return (
    <div className="space-y-2">
      <p className="font-semibold">{t('google-sheet-connect-description')}</p>
      <div className="flex flex-col sm:flex-row items-end space-x-4">
        <InputWithLabel
          label={t('google-sheet-id')}
          name="source-id"
          aria-label={t('google-sheet-id')}
          className="w-full max-w-md text-sm border"
          value={sheetId}
          onChange={(e) => {
            setData(null);
            setSheetId(e.target.value);
          }}
          required
        />
        <InputWithLabel
          label={t('google-sheet-name')}
          name="source-name"
          aria-label={t('google-sheet-name')}
          className="w-full max-w-md text-sm"
          value={sheetName}
          onChange={(e) => {
            setData(null);
            setSheetName(e.target.value);
          }}
          required
        />
      </div>
      <div className="flex flex-col sm:flex-row space-x-4 justify-between">
        <div className="dropdown w-64">
          <p className="px-1">{t('set-header-row-orientation')}</p>
          <div
            tabIndex={0}
            className="border border-gray-300 dark:border-gray-600 flex h-10 items-center px-4 justify-between cursor-pointer rounded text-sm font-bold"
          >
            <div className="flex items-center gap-2">
              {t(headerRowOrientation)}
            </div>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content dark:border-gray-600 p-2 shadow-md bg-base-100 w-full rounded border px-2"
          >
            {['horizontal', 'vertical']?.map((direction, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="w-full flex hover:bg-gray-100 hover:dark:text-black focus:bg-gray-100 focus:outline-none py-2 px-2 rounded text-sm font-medium gap-2 items-center"
                  onClick={() => {
                    if (document.activeElement) {
                      (document.activeElement as HTMLElement).blur();
                    }
                    setData(null);
                    setHeaderRowOrientation(
                      direction as 'horizontal' | 'vertical'
                    );
                  }}
                >
                  {t(direction)}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <Button
          type="button"
          variant="outline"
          className={classNames(
            data
              ? 'border-success bg-success hover:bg-success hover:border-success text-inherit hover:text-inherit'
              : 'border-inherit',
            'mt-4 mb-4 sm:mb-0 self-end'
          )}
          onClick={connectGoogleSheet}
          size="md"
        >
          {data ? t('google-sheet-connect-success') : t('google-sheet-connect')}
        </Button>
      </div>
    </div>
  );
}

export const ContentFieldMapper = ({
  templates,
  selectTemplate,
  setSelectTemplate,
  updateContentField,
  addContentField,
  removeContentField,
  headerRowOrientation,
  contentFields,
  data,
}: {
  templates: Template[];
  selectTemplate: Template | null;
  setSelectTemplate: Dispatch<SetStateAction<Template | null>>;
  contentFields: ContentFields;
  updateContentField: (field: [string, string], index: number) => void;
  addContentField: (field: [string, string]) => void;
  removeContentField: (field: [string, string]) => void;
  headerRowOrientation: 'horizontal' | 'vertical';
  data: string[][];
}) => {
  const [field, setField] = useState<[string, string]>(['', '']);
  const [editField, setEditField] = useState(true);
  const [current, setCurrent] = useState<number | null>(null);

  const { t } = useTranslation('common');

  const headerRow =
    headerRowOrientation === 'horizontal' ? data[0] : data.map((row) => row[0]);
  const contentRow =
    headerRowOrientation === 'horizontal' ? data[1] : data.map((row) => row[1]);

  const ContentFieldButton = ({
    field,
    index,
  }: {
    field: ContentFields[number];
    index: number;
  }) => {
    const [key, value] = field;

    const [reallyDelete, setReallyDelete] = useState(false);
    const deleteContentField = (index: number) => {
      console.info('index ', index, contentFields[index]);
      if (reallyDelete) {
        removeContentField(contentFields[index]);
        setReallyDelete(false);
      } else {
        setReallyDelete(true);
      }
    };
    return (
      <button
        type="button"
        className={classNames(
          'border p-2 rounded-full h-10',
          'flex flex-row items-center gap-x-2',
          current === index ? 'bg-blue-200' : 'bg-gray-100'
        )}
        onClick={() => {
          if (current === index) {
            setField(['', '']);
            setCurrent(null);
          } else {
            setField([key, value]);
            setCurrent(index);
            // setEditField(true);
          }
        }}
      >
        {key}:{value}
        {reallyDelete ? (
          <QuestionMarkCircleIcon
            className="w-6 h-6 text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              deleteContentField(index);
            }}
          />
        ) : (
          <XCircleIcon
            className="w-6 h-6 hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              deleteContentField(index);
            }}
          />
        )}
      </button>
    );
  };

  const SelectTemplate = () => {
    return (
      <div className="dropdown w-full">
        <div
          tabIndex={1}
          className="border border-gray-300 dark:border-gray-600 flex h-10 items-center px-4 justify-between cursor-pointer rounded text-sm font-bold"
        >
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            {selectTemplate?.title || t('select-template')}
          </div>
          <ChevronUpDownIcon className="w-5 h-5" />
        </div>
        <ul
          tabIndex={1}
          className="dropdown-content dark:border-gray-600 p-2 shadow-md bg-base-100 w-full rounded border px-2"
        >
          {templates?.map((tmplt, index) => (
            <li key={`select-template-${index}`}>
              <button
                type="button"
                className="flex hover:bg-gray-100 hover:dark:text-black focus:bg-gray-100 focus:outline-none py-2 px-2 rounded text-sm font-medium gap-2 items-center"
                onClick={() => {
                  setSelectTemplate(tmplt);
                }}
              >
                {tmplt.title}
              </button>
            </li>
          ))}
          {}
        </ul>
      </div>
    );
  };

  const TemplateFieldDropdown = () => (
    <div className="dropdown w-full">
      <p>{t('content-field-map-description')}</p>
      <div
        tabIndex={2}
        className="border border-gray-300 dark:border-gray-600 flex h-10 items-center px-4 justify-between cursor-pointer rounded text-sm font-bold"
      >
        <div className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          {field[0]}
        </div>
        <ChevronUpDownIcon className="w-5 h-5" />
      </div>
      <ul
        tabIndex={2}
        className="z-10 dropdown-content dark:border-gray-600 p-2 shadow-md bg-base-100 w-full rounded border px-2"
      >
        {selectTemplate.templateFields.map((source, index) => (
          <li key={`data-${index}`} className="z-50">
            <button
              className="w-full flex hover:bg-gray-100 hover:dark:text-black focus:bg-gray-100 focus:outline-none py-2 px-2 rounded text-sm font-medium gap-2 items-center"
              onClick={() => {
                setField((prev) => [source, prev[1]]);
              }}
            >
              {source}
            </button>
          </li>
        ))}
        {}
      </ul>
    </div>
  );

  const ContentDropdown = () => (
    <div className="dropdown w-full">
      <p>{t('content-field-map-description')}</p>
      <div
        tabIndex={3}
        className="border border-gray-300 dark:border-gray-600 flex h-10 items-center px-4 justify-between cursor-pointer rounded text-sm font-bold"
      >
        <div className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          {field[1]}
        </div>
        <ChevronUpDownIcon className="w-5 h-5" />
      </div>
      <ul
        tabIndex={3}
        className="dropdown-content dark:border-gray-600 p-2 shadow-md bg-base-100 w-full rounded border px-2"
      >
        {headerRow?.map((source, index) => (
          <li key={`data-${index}`}>
            <button
              className="w-full flex hover:bg-gray-100 hover:dark:text-black focus:bg-gray-100 focus:outline-none py-2 px-2 rounded text-sm font-medium gap-2 items-center"
              onClick={() => {
                setField((prev) => [prev[0], source]);
                if (contentFields.includes([field[0], source])) {
                  setCurrent(index);
                }
              }}
            >
              {source}
            </button>
          </li>
        ))}
        {}
      </ul>
    </div>
  );

  return (
    <div className="pb-4 space-y-4">
      <div className="w-64">
        <p className="font-semibold">{t('select-template')}</p>
        <SelectTemplate />
      </div>
      {selectTemplate ? (
        <>
          <div className="min-h-10">
            <p className="font-semibold">{t('content-fields')}</p>
            {contentFields.map((field, index) => (
              <ContentFieldButton key={field[0]} field={field} index={index} />
            ))}
          </div>
          {(editField && (
            <div>
              <p className="font-semibold">{t('update-field')}</p>
              <div className="flex flex-col sm:flex-row items-end justify-between sm:space-x-4">
                <TemplateFieldDropdown />
                <ContentDropdown />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 mb-4 sm:mb-0 self-end"
                  onClick={() => {
                    if (field[0] && field[1]) {
                      if (current !== null) {
                        updateContentField(field, current);
                      } else {
                        addContentField([field[0], field[1]]);
                      }
                      setField(['', '']);
                      setCurrent(null);
                      // setEditField(false);
                    }
                  }}
                  size="md"
                >
                  <PlusIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )) || <></>}
          {!editField && (
            <>
              <p className="font-semibold">{t('add-field')}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 mb-4 sm:mb-0 self-end"
                onClick={() => {
                  setField(['', '']);
                  // setEditField(true);
                }}
                size="md"
              >
                <PlusIcon className="w-5 h-5" />
              </Button>
            </>
          )}
        </>
      ) : (
        <></>
      )}
    </div>
  );
};
