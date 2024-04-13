import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import Modal from './Modal';
import { useEffect, useState } from 'react';
import {
  ChevronUpDownIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import GoogleSheetConnect, { ContentFieldMapper } from './GoogleSheetConnect';
import { Content } from '@prisma/client';

interface ConnectContentDialogProps {
  visible: boolean;
  onConfirm: (content: Content) => void | Promise<any>;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConnectContentDialog = ({
  visible,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
}: ConnectContentDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('common');

  const handleSubmit = async () => {
    try {
      const newContent: Content = {
        contentFields,
      };
      setLoading(true);
      await onConfirm();
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
    }
  };

  const [source, setSource] = useState<string>(t('connect-content-source'));
  const [contentFields, setContentFields] = useState<ContentFields>([]);
  const [data, setData] = useState<string[][]>([]);
  const [headerRowOrientation, setHeaderRowOrientation] = useState<
    'horizontal' | 'vertical'
  >('horizontal');

  useEffect(() => {
    return () => {};
  }, []);
  const addContentField = (field: [string, string]) => {
    setContentFields([...contentFields, field]);
  };
  const removeContentField = (field: [string, string]) => {
    console.info('remove field', field, 'contentFields', contentFields);
    setContentFields(contentFields.filter((f) => f !== field));
  };
  const updateContentField = (field: [string, string], index: number) => {
    const newContentFields = [...contentFields];
    newContentFields[index] = field;
    setContentFields(newContentFields);
  };

  return (
    <Modal open={visible} close={onCancel} className="max-w-[700px]">
      {/* eslint-disable-next-line i18next/no-literal-string, i18next/no-literal-string, i18next/no-literal-string */}
      <Modal.Header>{t('connect-content-source')}</Modal.Header>
      <Modal.Body className="text-sm leading-6">
        <div className="dropdown">
          <div
            tabIndex={0}
            className="border border-gray-300 dark:border-gray-600 flex h-10 items-center px-4 justify-between cursor-pointer rounded text-sm font-bold"
          >
            <div className="flex items-center gap-2">
              <ArrowTopRightOnSquareIcon className="w-5 h-5" /> {source}
            </div>
            <ChevronUpDownIcon className="w-5 h-5" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content dark:border-gray-600 p-2 shadow-md bg-base-100 w-full rounded border px-2"
          >
            {[['Google Sheet', 'GOOGLE_SHEET']].map(([key, value]) => (
              <li key={`select-${key}`}>
                <button
                  className="w-full flex hover:bg-gray-100 hover:dark:text-black focus:bg-gray-100 focus:outline-none py-2 px-2 rounded text-sm font-medium gap-2 items-center"
                  onClick={() => {
                    setSource(value);
                    if (document.activeElement) {
                      (document.activeElement as HTMLElement).blur();
                    }
                  }}
                >
                  {key}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {(source === 'GOOGLE_SHEET' && (
          <GoogleSheetConnect
            setData={setData}
            setHeaderRowOrientation={setHeaderRowOrientation}
            headerRowOrientation={headerRowOrientation}
          />
        )) || <></>}
        {(data && data.length && (
          <>
            <hr className="my-2" />
            <ContentFieldMapper
              contentFields={contentFields}
              headerRowOrientation={headerRowOrientation}
              updateContentField={updateContentField}
              addContentField={addContentField}
              removeContentField={removeContentField}
              data={data}
            />
          </>
        )) || <></>}
        <hr />
      </Modal.Body>
      <Modal.Footer>
        {(data && data.length && (
          <p className="font-semibold place-self-start">
            {t('connect-content-fields')}
          </p>
        )) || <></>}
        <Button type="button" variant="outline" onClick={onCancel} size="md">
          {cancelText || t('cancel')}
        </Button>
        <Button
          loading={loading}
          disabled={contentFields.length === 0}
          type="button"
          color="error"
          onClick={handleSubmit}
          size="md"
        >
          {confirmText || t('save-changes')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConnectContentDialog;

export type ContentFields = [string, string][];
