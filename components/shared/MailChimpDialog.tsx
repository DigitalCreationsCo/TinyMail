import { useTranslation } from 'next-i18next';
import { Button, Input } from 'react-daisyui';
import Modal from './Modal';
import { useState } from 'react';
import Card from './Card';
import { set } from 'zod';
import InputWithLabel from './InputWithLabel';

interface MailChimpDialogProps {
  apiKey: string;
  setApiKey: (value: string) => void;
  visible: boolean;
  onConfirm: () => void | Promise<any>;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const MailChimpDialog = ({
  apiKey,
  setApiKey,
  visible,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
}: MailChimpDialogProps) => {
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

  return (
    <Modal open={visible} close={onCancel}>
      {/* eslint-disable-next-line i18next/no-literal-string, i18next/no-literal-string, i18next/no-literal-string */}
      <Modal.Header>
        {t('mailchimp-use-api-key')}{' '}
        <a
          href={
            'https://mandrillapp.com/login/?referrer=%2Fsettings%2Findex%2F'
          }
          target="_blank"
          className="link"
        >
          What is Mandrill?
        </a>
      </Modal.Header>
      <Modal.Body className="text-sm leading-6">
        <InputWithLabel
          label={t('mailchimp')}
          name="mailchimp"
          aria-label="Mailchimp API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full max-w-md text-sm"
          required
          // disabled={!allowEmailChange}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="outline" onClick={onCancel} size="md">
          {cancelText || t('cancel')}
        </Button>
        <Button
          loading={loading}
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

export default MailChimpDialog;
