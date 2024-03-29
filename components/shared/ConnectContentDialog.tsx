import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import Modal from './Modal';
import { useState } from 'react';
import InputWithLabel from './InputWithLabel';
import { ChevronUpDownIcon, LinkIcon } from '@heroicons/react/24/outline';
import GoogleSheetConnect from './GoogleSheetConnect';

interface ConnectContentDialogProps {
  visible: boolean;
  onConfirm: () => void | Promise<any>;
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
      setLoading(true);
      await onConfirm();
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
    }
  };

  const [source, setSource] = useState(t('connect-content-source'));
  const [contentFields, setContentFields] = useState<string[]>([]);
  const addContentField = (field: string) => {
    setContentFields([...contentFields, field]);
  }
  const removeContentField = (field: string) => {
    setContentFields(contentFields.filter((f) => f !== field));
  }
  const updateContentField = (field: string, index: number) => {
    const newContentFields = [...contentFields];
    newContentFields[index] = field;
    setContentFields(newContentFields);
  }

  return (
    <Modal open={visible} close={onCancel} className="max-w-[700px]">
      {/* eslint-disable-next-line i18next/no-literal-string, i18next/no-literal-string, i18next/no-literal-string */}
      <Modal.Header>{t('connect-content-source')}</Modal.Header>
      <Modal.Body className="text-sm leading-6">

      <div className="dropdown w-60">
          <div
            tabIndex={0}
            className="border border-gray-300 dark:border-gray-600 flex h-10 items-center px-4 justify-between cursor-pointer rounded text-sm font-bold"
          >
            <div className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" /> {source}
            </div>
            <ChevronUpDownIcon className="w-5 h-5" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content dark:border-gray-600 p-2 shadow-md bg-base-100 w-full rounded border px-2"
          >
            {['GOOGLE_SHEET'].map((source, index) => (
              <li key={index}>
                <button
                  className="w-full flex hover:bg-gray-100 hover:dark:text-black focus:bg-gray-100 focus:outline-none py-2 px-2 rounded text-sm font-medium gap-2 items-center"
                  onClick={() => {setSource(source);
                    if (document.activeElement) {
                      (document.activeElement as HTMLElement).blur();
                    }}}
                >
                  {source}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {source==='GOOGLE_SHEET' && <GoogleSheetConnect /> || <></>}

      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="outline" onClick={onCancel} size="md">
          {cancelText || t('cancel')}
        </Button>
        <Button loading={loading} type="button" color="error" onClick={handleSubmit} size="md">
          {confirmText || t('save-changes')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConnectContentDialog;
