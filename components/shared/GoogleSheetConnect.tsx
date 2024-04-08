import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import InputWithLabel from './InputWithLabel';
import type { ApiResponse } from 'types';
import toast from 'react-hot-toast';
import { GoogleSheetData } from '@/lib/google-sheet';
import { ContentFields } from './ConnectContentDialog';
import {
  ChevronUpDownIcon,
  LinkIcon,
  PlusIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

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
  removeContentField: (field: string) => void;
  headerRowOrientation: 'horizontal' | 'vertical';
  data: string[][];
}) => {
  const { t } = useTranslation('common');

  const [field, setField] = useState<[string, string]>(['', '']);
  const [current, setCurrent] = useState<number>(0);

  const headerRow =
    headerRowOrientation === 'horizontal' ? data[0] : data.map((row) => row[0]);
  const contentRow =
    headerRowOrientation === 'horizontal' ? data[1] : data.map((row) => row[1]);
  const ContentFields = () => (
    <div>
      {contentFields.map(([key, value]) => (
        <button key={`${key}`} onClick={() => setField([key, value])}>
          {key}:{value}
        </button>
      ))}
    </div>
  );
  const FieldInput = () => (
    <InputWithLabel
      label={t('set-field-name')}
      name="field-name"
      aria-label={t('set-field-name')}
      className="w-full max-w-md text-sm"
      value={field?.[0]}
      onChange={(e) => setField((prevField) => [e.target.value, prevField[1]])}
      required
    />
  );
  const ContentDropdown = () => (
    <div className="dropdown w-full">
      <p>{t('content-field-map-description')}</p>
      <div
        tabIndex={0}
        className="border border-gray-300 dark:border-gray-600 flex h-10 items-center px-4 justify-between cursor-pointer rounded text-sm font-bold"
      >
        <div className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
        </div>
        <ChevronUpDownIcon className="w-5 h-5" />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content dark:border-gray-600 p-2 shadow-md bg-base-100 w-full rounded border px-2"
      >
        {contentRow?.map((source, index) => (
          <li key={`data-${index}`}>
            <button
              className="w-full flex hover:bg-gray-100 hover:dark:text-black focus:bg-gray-100 focus:outline-none py-2 px-2 rounded text-sm font-medium gap-2 items-center"
              onClick={() => {
                // setField([headerRow[index], source]);
                // setCurrent(index);
                // addContentField([headerRow[index], source]);
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
    <div className="py-2">
      <ContentFields />
      {'field: ' + field[0]}
      {'field content: ' + field[1]}
      {(field && (
        <>
          <p className="font-semibold">{t('update-field')}</p>
          <div className="flex flex-col sm:flex-row items-end justify-between border sm:space-x-4">
            <FieldInput />
            <ContentDropdown />
            <Button
              type="button"
              variant="outline"
              className="mt-4 mb-4 sm:mb-0 self-end"
              onClick={() => {
                if (field) {
                  updateContentField(field, current);
                }
                setField(['', '']);
              }}
              size="md"
            >
              <CheckIcon className="w-5 h-5" />
            </Button>
          </div>
        </>
      )) || <></>}
      {!field && (
        <>
          <p className="font-semibold">{t('add-field')}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 mb-4 sm:mb-0 self-end"
            onClick={() => {
              setField(['', '']);
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
