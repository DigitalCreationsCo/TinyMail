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

export default function GoogleSheetConnect({
  setData,
  setHeaderRowOrientation,
  headerRowOrientation,
}: {
  setData: Dispatch<SetStateAction<string[][]>>;
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
    <div className="py-2">
      <p className="font-semibold">{t('google-sheet-connect-description')}</p>
      <div className="flex flex-col sm:flex-row items-end space-x-4">
        <InputWithLabel
          label={t('google-sheet-id')}
          name="source-id"
          aria-label={t('google-sheet-id')}
          className="w-full max-w-md text-sm"
          value={sheetId}
          onChange={(e) => setSheetId(e.target.value)}
          required
        />
        <InputWithLabel
          label={t('google-sheet-name')}
          name="source-name"
          aria-label={t('google-sheet-name')}
          className="w-full max-w-md text-sm"
          value={sheetName}
          onChange={(e) => setSheetName(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col sm:flex-row items-end space-x-4 justify-between">
        <div className="dropdown">
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
            {['horizontal', 'vertical']?.map((orn, index) => (
              <li key={index}>
                <button
                  className="w-full flex hover:bg-gray-100 hover:dark:text-black focus:bg-gray-100 focus:outline-none py-2 px-2 rounded text-sm font-medium gap-2 items-center"
                  onClick={() => {
                    setHeaderRowOrientation(orn as 'horizontal' | 'vertical');
                  }}
                >
                  {t(orn)}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-4 mb-4 sm:mb-0 self-end"
          onClick={connectGoogleSheet}
          size="md"
        >
          {t('google-sheet-connect')}
        </Button>
      </div>
    </div>
  );
}

export const ContentFieldMapper = ({
  updateContentField,
  addContentField,
  removeContentField,
  headerRowOrientation,
  contentFields,
  data,
}: {
  contentFields: ContentFields;
  updateContentField: (field: [string, string], index: number) => void;
  addContentField: (field: [string, string]) => void;
  removeContentField: (field: [string, string]) => void;
  headerRowOrientation: 'horizontal' | 'vertical';
  data: string[][];
}) => {
  console.info('contentFields', contentFields);

  const { t } = useTranslation('common');

  const [field, setField] = useState<[string, string]>(['', '']);
  const [editField, setEditField] = useState(false);
  const [current, setCurrent] = useState<number | null>(null);

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
            setEditField(true);
          }
        }}
      >
        {key}: {value}
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

  const ContentDropdown = () => (
    <div className="dropdown w-full">
      <p>{t('content-field-map-description')}</p>
      <div
        tabIndex={0}
        className="border border-gray-300 dark:border-gray-600 flex h-10 items-center px-4 justify-between cursor-pointer rounded text-sm font-bold"
      >
        <div className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          {field[1]}
        </div>
        <ChevronUpDownIcon className="w-5 h-5" />
      </div>
      <ul
        tabIndex={0}
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
    <div className="pb-4">
      <div className="min-h-10">
        <p className="font-semibold">{t('content-fields')}</p>
        {contentFields.map((field, index) => (
          <ContentFieldButton key={field[0]} field={field} index={index} />
        ))}
      </div>
      {/* {'field: ' + field[0]}
      {', '}
      {'field content: ' + field[1]} */}
      {(editField && (
        <>
          <p className="font-semibold">{t('update-field')}</p>
          <div className="flex flex-col sm:flex-row items-end justify-between sm:space-x-4">
            <InputWithLabel
              label={t('set-field-name')}
              name="field"
              aria-label={t('set-field-name')}
              className="w-full max-w-md text-sm"
              value={field?.[0]}
              onChange={(e) =>
                setField((prevField) => [e.target.value, prevField[1]])
              }
              required
            />
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
                  setEditField(false);
                }
              }}
              size="md"
            >
              <CheckIcon className="w-5 h-5" />
            </Button>
          </div>
        </>
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
              setEditField(true);
            }}
            size="md"
          >
            <PlusIcon className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
};
